import BaseDto from "../../common/dto/base.dto.js"
import Joi from "joi"
class RegisterDto extends BaseDto{
    static schema = Joi.object({
        name:Joi.string().min(3).max(100).required(),
        email:Joi.string().required().email(),
        password:Joi.string().min(4).max(20).required()
    })
}
class LoginDto extends BaseDto{
    static schema= Joi.object({
        email:Joi.string().required().email(),
        password:Joi.string().min(4).max(20).required()
    })
}
export {RegisterDto,LoginDto}