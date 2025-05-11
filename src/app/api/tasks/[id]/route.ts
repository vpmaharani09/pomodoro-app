import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const task = await Task.findOne({ _id: params.id, userId: payload.userId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid token or bad request" },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updatedTask = await Task.findOneAndUpdate(
      { _id: params.id, userId: payload.userId },
      { $set: { name, focusTime, cycle, dueDate, priority } },
      { new: true }
    );
    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTask);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid token or bad request" },
      { status: 401 }
    );
  }
}
