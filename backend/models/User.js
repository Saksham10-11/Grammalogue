import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    token: {
      type: String,
    },
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment", // Referencing the Assessment schema
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
