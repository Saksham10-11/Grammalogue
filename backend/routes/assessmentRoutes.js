import express from "express";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";

const router = express.Router();

// GET /all - Retrieves all assessments for a user with transformed MongoDB IDs
router.get("/all", async (req, res) => {
  try {
    // Authentication: Verify user through email in headers
    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    // Populate assessments to get full assessment objects instead of just IDs
    const user = await User.findOne({ email: currUserEmail }).populate(
      "assessments"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Transform MongoDB _id to id for frontend consistency
    const assessmentsWithIds = user.assessments.map((assessment) => ({
      id: assessment._id,
      data: assessment.data,
      dateAndTime: assessment.dateAndTime,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    }));

    return res.status(200).json({ assessments: assessmentsWithIds });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /save - Stores assessment data as stringified JSON and links it to user
router.post("/save", async (req, res) => {
  try {
    const { assessmentData } = req.body;

    console.log("Assessment data ready to save:", assessmentData);

    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Store assessment data as stringified JSON to maintain complex data structures
    const newAssessment = new Assessment({
      data: JSON.stringify(assessmentData),
    });
    const savedAssessment = await newAssessment.save();

    // Link assessment to user by storing its reference
    user.assessments.push(savedAssessment._id);
    await user.save();

    return res.status(201).json({
      message: "Assessment saved successfully.",
      assessment: savedAssessment,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id: assessmentId } = req.params;

    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify assessment ownership before deletion
    if (!user.assessments.includes(assessmentId)) {
      return res
        .status(404)
        .json({ error: "Assessment not associated with the user." });
    }

    await Assessment.findByIdAndDelete(assessmentId);

    // Remove assessment reference from user's assessments array
    user.assessments = user.assessments.filter(
      (id) => id.toString() !== assessmentId
    );
    await user.save();

    return res
      .status(200)
      .json({ message: "Assessment deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: assessmentId } = req.params;

    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify assessment ownership before retrieval
    if (!user.assessments.includes(assessmentId)) {
      return res
        .status(404)
        .json({ error: "Assessment not associated with the user." });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found." });
    }

    return res.status(200).json({
      assessment: {
        id: assessment._id,
        data: assessment.data,
        dateAndTime: assessment.dateAndTime,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;