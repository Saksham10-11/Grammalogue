import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import uploadRouter from "./routes/upload.js";
import userRouter from "./routes/userRoutes.js";
import assessmentRouter from "./routes/assessmentRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

const PRODUCTION_URL = process.env.API_PRODUCTION_URL;

const FRONTEND_URL = process.env.API_FRONTEND_URL;

const MONGO_URL = process.env.MONGODB_URI;

// Configure CORS with specific options
app.use(
  cors({
    origin: [FRONTEND_URL, PRODUCTION_URL], // Allow both Vite dev server and production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-user-email"  // Add custom header
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set larger limit for JSON payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/upload", uploadRouter);
app.use("/users", userRouter);
app.use("/assessments", assessmentRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// MongoDB connection

mongoose.connect(`${MONGO_URL}`)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
