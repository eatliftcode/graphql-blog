import JWT, { sign } from "jsonwebtoken"

export const getUserFromJwtToken = (token : string) => {
    const signature = process.env.JWT_SIGNATURE;
    try{
        return JWT.verify(token, signature!) as {userId: number}
    }
    catch(error){
        return null
    }
}