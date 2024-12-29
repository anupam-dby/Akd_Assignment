import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listing.route.js";
import path from "path";

dotenv.config(); // Load environment variables

// Debug the MongoDB URI (make sure it's correct in your .env)
console.log("MongoDB URI:", process.env.MONGO);

// Set strict query option to avoid deprecation warnings
mongoose.set("strictQuery", false);

// MongoDB connection with the URI from .env or hardcoded value
mongoose
    .connect(process.env.MONGO || "mongodb://localhost:27017/real_estate?directConnection=true")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Resolve __dirname for ES modules (useful for serving static files)
const __dirname = path.resolve();

const app = express();

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Define API routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// Serve frontend static files (make sure the build path is correct)
app.use(express.static(path.join(__dirname, "/client/dist")));

// Catch-all route for serving the index.html for the frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"), (err) => {
        if (err) {
            console.error("Error serving the frontend:", err);
            res.status(500).send("Error loading the frontend.");
        }
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).send("Server is up and running");
});

// Global error handler for the server
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// Server setup (port defaults to 3000 if not set in .env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});