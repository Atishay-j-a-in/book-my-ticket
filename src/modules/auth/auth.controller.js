import pool from "../../common/db/db.js";
import ApiResponse from "../../common/utils/response.js";
import ApiError from "../../common/utils/apierror.js";
import { compareBcrypt, hashBcrypt, hashCrypto } from "../../common/utils/hash.utility.js";
import { generateRefreshToken , generateAccessToken} from "../../common/utils/jwt.utility.js"



const register=async function(req,res){
    const {name, email,password}= req.body
    const find = await pool.query("select * from users where email=$1",[email])
    if(find.rowCount){
        throw ApiError.conflict("user already exists")
    }
    const hashPass = await hashBcrypt(password)
    const result = await pool.query("insert into users ( name, email , password) values ($1,$2,$3) RETURNING *;",[name,email,hashPass])
  
    if(result.rowCount===0){
        throw ApiError.failed("Couldn't register user")
    }
    const user = result.rows[0]



    ApiResponse.created(res,"user created",200,{name:user.name,id:user.id, email:user.email})

}

const login=async function (req,res) {
    const {email, password}= req.body
    const user = await pool.query("select id, name, password from users where email=$1;",[email])
   
    if(!user.rowCount) throw ApiError.unauthorized("email or password incorrect")
    let userPassword =user.rows[0].password
    const isMatched=await compareBcrypt(password,userPassword)
    if( !isMatched){
        throw ApiError.unauthorized("wrong password")
    }
    const refereshToken = generateRefreshToken({id:user.rows[0].id, name:user.rows[0].name})
    const hashToken= hashCrypto(refereshToken)
    const accessToken = generateAccessToken({id:user.rows[0].id, name:user.rows[0].name})
    await pool.query("update users set refreshToken=$2 where id=$1;",[user.rows[0].id,hashToken])

    res.cookie("refreshToken",refereshToken,{
        httpOnly:true,
        secure:true, 
        maxAge:1000 * 60 * 60 * 24 * 7,
     
    })

    ApiResponse.ok(res,"User loggedIn!",200,{name:user.name, accessToken })
}


const logout = async function(req,res) {
    const {id} = req.user
    await pool.query("update users set  refreshToken = null where id= $1 ;",[id])    
    res.clearCookie("refreshToken")
    ApiResponse.ok(res,"logged out successfully",200)
}
const refreshAccessToken = async function(req,res){
    const {id, name }= req.user
    const accessToken = generateAccessToken({id,name})
    const refereshToken = generateRefreshToken({id,name})
    const hashtoken = hashCrypto(refereshToken)
    await pool.query("update users set refreshToken = $1 where id= $2",[hashtoken,id])
    res.cookie("refreshToken",refereshToken,{
        httpOnly:true,
        secure:true,
        maxAge:1000 * 60 * 60 * 24 * 7
    })
    ApiResponse.created(res,"access token is refreshed",200,{accessToken})
}
export {register,login , logout, refreshAccessToken}