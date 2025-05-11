import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const tasks = await Task.find({ userId: payload.userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(tasks);
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const body = await req.json();
    const { name, focusTime, cycle, dueDate, priority } = body;
    if (!name || !focusTime || !cycle || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const newTask = await Task.create({
      name,
      focusTime,
      cycle,
      dueDate,
      priority,
      userId: payload.userId,
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid token or bad request" },
      { status: 401 }
    );
  }
}
