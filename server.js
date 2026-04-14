import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import 'dotenv/config'
import authRouter from "./src/modules/auth/auth.route.js"
import pool from "./src/common/db/db.js";
import userRouter from "./src/modules/user/user.route.js"
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse

await pool.query(`CReate Table if not exists Users (
  id serial primary key,
  name varchar(255) NOT NULL,
  email varchar(322) unique NOT NULL,
  password varchar(200) NOT NULL,
  refreshToken text,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS seats (
     id SERIAL PRIMARY KEY,
     owner INT ,
     name varchar(30),
     isbooked INT DEFAULT 0,
     FOREIGN KEY (owner) REFERENCES users(id)
  );
  INSERT INTO seats (isbooked)
  SELECT 0 FROM generate_series(1, 40)
  WHERE NOT EXISTS (SELECT 1 FROM seats);`
)

const app = new express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({credentials:true}));// this will help to pass cookies 
app.use(authRouter)
app.use(userRouter)
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong"
  });
});




app.listen(port, () => console.log("Server starting on port: " + port));

export {__dirname}