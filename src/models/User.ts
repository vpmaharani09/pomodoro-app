import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    focus: { type: Number, default: 25 },
    short: { type: Number, default: 5 },
    long: { type: Number, default: 15 },
    cycle: { type: Number, default: 4 },
  },
});

export default models.User || mongoose.model("User", UserSchema); 