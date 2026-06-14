import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    transports: ["websocket"],
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    },
});

const isK8s = !!process.env.KUBERNETES_SERVICE_HOST;
const hasRedisUrl = !!process.env.REDIS_URL;

// Only connect to Redis in Kubernetes or if REDIS_URL is explicitly configured
if (isK8s || hasRedisUrl) {
    const redisUrl = process.env.REDIS_URL || "redis://redis-service:6379";
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    try {
        await pubClient.connect();
        await subClient.connect();
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.io: Connected to Redis and initialized cluster adapter");
    } catch (err) {
        console.error("Socket.io: Failed to initialize Redis adapter, using in-memory adapter fallback:", err.message);
    }
} else {
    console.log("Socket.io: Using default in-memory adapter (Local Dev mode)");
}    

io.use(socketAuthMiddleware)

const broadcastOnlineUsers = async () => {
    try {
        const sockets = await io.fetchSockets();
        const onlineUsers = Array.from(new Set(sockets.map(s => s.data.userId).filter(Boolean)));
        io.emit("getOnlineUsers", onlineUsers);
    } catch (error) {
        console.error("Error broadcasting online users:", error);
    }
};

io.on("connection", (socket) => {
    console.log("User connected", socket.user.fullName);

    const userId = socket.userId;
    socket.data.userId = userId;
    socket.join(userId);

    broadcastOnlineUsers();

    socket.on("sendMessage", (message) => {
        console.log("Message received:", message);
        const receiverId = message.receiverId;
        io.to(receiverId).emit("getMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.user.fullName);
        broadcastOnlineUsers();
    });
});

export { io, server, app };