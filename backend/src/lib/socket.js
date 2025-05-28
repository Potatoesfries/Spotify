import {Server} from 'socket.io';
import  { Message } from '../models/message.model.js';

export const initializeSocket = (server) => {
    
    // create an instance of socket.io server
    // and pass the http server to it
    const io = new Server(server,{
        cors:{
            origin: "http://localhost:3000",
            credentials: true
        }
    });

    const userSockets = new Map() // the key is the userId: and the value is the socketId
    const userActivity = new Map() // the key is the userId: and the value is the activity

    io.on("connection",(socket)=>{

        // when a user connects
        socket.on("user_connected", (userId) => {
            userSockets.set(userId, socket.id)
            userActivity.set(userId, "Idle")


            // broadcast to all connected socket that this user just logged in
            io.emit("user_connected", userId)
           
            socket.emit("user_online", Array.from(userSockets.keys()))
            // emit the user activity
            io.emit("Activity", Array.from(userActivity.entries()))
        })

        socket.on("update_activity", ({userId, activity}) => {
            console.log("activity updated", userId, activity)
                userActivity.set(userId, activity)
                io.emit("activity_updated", {userId, activity})
        })


        socket.on("send_message", async (data)=>{
            try {
                const {senderId, receiverId, content} = data;

                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                })

                // send to receiver in real time if they are online 
                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message);
                }

                socket.emit("message_sent", message)

            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("message_error", {error: "Failed to send message"});
            }
        })
        
        socket.on("disconnect",()=>{
            let disconnectedUser
            for(const[userId, socketId] of userSockets.entries()){
                if(socketId === socket.id){
                    disconnectedUser = userId;
                    userSockets.delete(userId);
                    userActivity.delete(userId);
                    break;
                }
            }
            if (disconnectedUser) {
                io.emit("user_disconnected", disconnectedUser);
            }
        })
    })
}

