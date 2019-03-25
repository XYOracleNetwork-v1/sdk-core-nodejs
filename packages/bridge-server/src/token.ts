import jwt from 'jsonwebtoken'

const secret = process.env.SECRET || 'xyxyo'

export const sign = (data: any) => jwt.sign(data, secret)

export const verify = (token: string) => jwt.verify(token, secret)
