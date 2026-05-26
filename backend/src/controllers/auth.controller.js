import userModel from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import redisClient from '../config/cache.js';


export const registerController = async (req, res) => {
    try {
        const user = await authService.createUser(req.body);

        const token = user.generateJWT();

        delete user._doc.password;

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            });
        }

        const token = user.generateJWT();

        delete user._doc.password;

        res.status(200).json({ user, token });

    } catch (err) {
        console.error(err);
        res.status(400).send({ message: err.message });
    }
}

export const profileController = async (req, res) => {
    const user = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete user.password;
    res.status(200).json({
        user
    });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: 'Token is required for logout' });
        }
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        res.cookie('token', '');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).send({ message: error.message });
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const allUsers = await authService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
}