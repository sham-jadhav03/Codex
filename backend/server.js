import 'dotenv/config';
import app from './src/app.js';
import http from 'http';
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './src/models/project.model.js'
import connect from './src/config/db.js'
import { genarateResult } from './src/services/ai.service.js'


connect();

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.use(async (socket, next) => {

    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid project ID'))
        }


        socket.project = await projectModel.findById(projectId);


        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }


        socket.user = decoded;

        next();

    } catch (error) {
        next(error)
    }

})

io.on('connection', (socket) => {

    socket.roomId = socket.project._id.toString();

    console.log(`a user connected`);

    socket.join(socket.roomId);

    socket.on('project-message', async data => {
        const message = data.message;

        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if (aiIsPresentInMessage) {

            const prompt = message.replace('@ai', '').trim();

            // Fetch the latest file tree from the database to supply context to Gemini
            const latestProject = await projectModel.findById(socket.project._id);
            const fileTree = latestProject?.fileTree || {};

            const result = await genarateResult(prompt, fileTree);

            io.to(socket.roomId).emit('project-message', {
                message: result,
                user: {
                    _id: 'ai',
                    email: 'AI'
                }
            })

            return;
        }


    })

    socket.on('cursor-move', data => {
        socket.broadcast.to(socket.roomId).emit('cursor-move', {
            userId: socket.user._id,
            email: socket.user.email,
            file: data.file,
            position: data.position
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId);
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})