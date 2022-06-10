import  JWT  from 'jsonwebtoken';
export const getJwtToken = (userId: Number) =>{
    const secretKey = process.env.JWT_SIGNATURE

    const token = JWT.sign({
        userId: userId,
    }, secretKey!, {expiresIn: 360000} )

    return token;
}