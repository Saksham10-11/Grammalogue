import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/save", async (req, res) => {
  const { username, email, token } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        username,
        email,
        token,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error creating/retrieving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
