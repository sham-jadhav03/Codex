import jwt from "jsonwebtoken";
import redisClient from "../config/cache.js";
import userModel from "../models/user.model.js";


export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[ 1 ];
        
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        let isBlackListed = false;
        try {
            isBlackListed = await redisClient.get(token);
        } catch (err) {
            console.error("Redis connection error, skipping blacklist check:", err.message);
        }

        if (isBlackListed) {
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}