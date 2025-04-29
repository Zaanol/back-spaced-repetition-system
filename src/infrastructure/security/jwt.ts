import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { TokenDTO } from "../../application/dtos/tokenDTO";

export const generateToken = (payload: any): TokenDTO => {
    return {
        token: jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' })
    }
};

export const verifyToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};