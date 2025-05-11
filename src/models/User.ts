import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || mongoose.model("User", UserSchema); 