import router from "../auth/auth.route.js";
import { authenticate } from "../auth/auth.middleware.js";
import ApiError from "../../common/utils/apierror.js";
import pool from "../../common/db/db.js";
import ApiResponse from "../../common/utils/response.js";
import { __dirname } from "../../../server.js";

router.get("/", async (req, res) => {

  res.sendFile(__dirname + "/public/auth.html");
});
router.get("/theatre",authenticate,async(req,res)=>{
  res.sendFile(__dirname + "/public/index.html")
})
//get all seats
router.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose

  res.send(result.rows);
});

router.put("/:id/:name",authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    if(!id || !name){
        throw ApiError.badRequest("seat id and user name required")
    }
    const userId = req.user.id
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      throw ApiError.failed("Seat already booked")
      return;
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1,name=$3, owner =$2 where id = $1 returning *";
    const updateResult = await conn.query(sqlU, [id,userId,name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders
    if(!updateResult.rowCount){
        throw ApiError.failed("error during confirming the seat")
    }
    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    ApiResponse.ok(res,"seat booked",200,updateResult.rows[0]);
  } catch (ex) {
    await conn.query("ROLLBACK"); 
    throw ApiError.failed("failed to book seat")
  }
});


export default router