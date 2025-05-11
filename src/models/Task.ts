import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema({
  name:       { type: String, required: true },
  focusTime:  { type: Number, required: true },
  cycle:      { type: Number, required: true },
  dueDate:    { type: Date },
  priority:   { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default models.Task || mongoose.model("Task", TaskSchema); 