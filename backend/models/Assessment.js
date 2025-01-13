import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
    },
    dateAndTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Assessment", assessmentSchema);
