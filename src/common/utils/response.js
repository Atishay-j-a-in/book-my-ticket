class ApiResponse {
    static ok(res, message,code , data=null){
        return res.status(code?code:200).json({
           success:true, message, data, 
        })
    }
    static created( res, message, code, data=null){
        return res.status(code?code:201).json({
            success:true,message,data
        })
    }
}

export default ApiResponse