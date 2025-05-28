import express from "express"
import dotenv from "dotenv"
import { clerkMiddleware } from '@clerk/express'
import fileUpload from "express-fileupload"
import path from "path"
import cors from "cors"
import { createServer } from "http"
import cron from "node-cron"
import fs from "fs"

import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import adminRoutes from "./routes/admin.route.js"
import songRoutes from "./routes/song.route.js"
import albumRoutes from "./routes/album.route.js"
import statRoutes from "./routes/stat.route.js"
import { connectDB } from "./lib/db.js"
import { initializeSocket } from "./lib/socket.js"

dotenv.config()

const app = express();
const PORT = process.env.PORT

// initializing socket.io
const httpSever = createServer(app);
initializeSocket(httpSever)

const __dirname = path.resolve();

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }

))

// middleware to make it so that the post data will be stored in the body
app.use(express.json())

// this will add auth to the req object
app.use(clerkMiddleware())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
    createParentPath: true,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB maximum file size
    }
}))

// cron jobs
const tempDir = path.join(process.cwd(), "temp");
cron.schedule("0 * * * *", () => {
    if (fs.existsSync(tempDir)) {
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                console.log("error", err);
                return;
            }
            for (const file of files) {
                fs.unlink(path.join(tempDir, file), (err) => { });
            }
        });
    }
});



app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes)
app.use("/api/stats", statRoutes)

if(process.env.NODE_ENV === "production"){
        const frontendDist = path.join(__dirname, "../frontend/dist");
        app.use(express.static(frontendDist));
        app.get("*", (req, res) => {
            res.sendFile(path.join(frontendDist, "index.html"));
        });
    }

app.use((err, req, res, next) => {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? " internal server error" : err.message })
})

httpSever.listen(PORT, () => {
    console.log('server is running on port ' + PORT)
    connectDB();
});
