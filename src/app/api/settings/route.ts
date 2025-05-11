import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const DEFAULTS = { focus: 25, short: 5, long: 15, cycle: 4 };

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // If user.settings exists, return it, else return defaults
    const settings = user.settings || DEFAULTS;
    return NextResponse.json(settings);
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { focus, short, long, cycle } = await req.json();
    user.settings = { focus, short, long, cycle };
    await user.save();
    const s = user.settings;
    return NextResponse.json({
      focus: s.focus,
      short: s.short,
      long: s.long,
      cycle: s.cycle,
    });
  } catch (e) {
    console.error("PUT /api/settings - Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
