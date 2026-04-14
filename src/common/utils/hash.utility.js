import bcrypt from "bcryptjs";
import crypto from "crypto"

const hashBcrypt= async(data)=>await bcrypt.hash(data,10)
const compareBcrypt = async(data,hash)=>await bcrypt.compare(data,hash)

const hashCrypto = (data)=>crypto.createHash("sha256").update(data).digest("hex")
const compareCrypto = (data,hash)=>hash===hashCrypto(data)

export {hashBcrypt,hashCrypto,compareBcrypt,compareCrypto}
