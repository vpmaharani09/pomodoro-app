import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
} 