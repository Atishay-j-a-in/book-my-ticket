import ApiError from "../../common/utils/apierror.js";
import { verifyAccessToken, verifyRefreshToken } from "../../common/utils/jwt.utility.js";
import pool from "../../common/db/db.js";
import { hashCrypto } from "../../common/utils/hash.utility.js";
const authenticate = async ( req, res , next)=>{
    let token 
    if(req.headers.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
    }
    if(!token && req.cookies?.accessToken){
        token = req.cookies.accessToken
    }
    if(!token){
        throw ApiError.unauthorized("Not authenticated")
    }
   
    const decoded = verifyAccessToken(token).payload
   
    const user = await pool.query("Select id from users where id=$1",[decoded.id])
    if(!user.rowCount){
        throw ApiError.unauthorized("user no longer exist")
    }
    req.user={
        id:decoded.id,
        name:decoded.name
    }
    next()
}
const authenticateRefreshToken = async function(req,res,next) {
    const token = req.cookies.refreshToken

    if(!token){
        throw ApiError.notFound("refresh token not found")
    }
    const hashToken = hashCrypto(token)
    
    const user = await pool.query("select id from users where refreshToken = $1;",[hashToken])
    if(!user.rowCount){
        throw ApiError.unauthorized("invalid refresh token")
    }
    const decode = verifyRefreshToken(token).payload
    req.user={
        id:decode.id,
        name:decode.name
    }
    next()

} 

export { authenticate, authenticateRefreshToken}