import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function getPeriodRange(period: string) {
  const now = new Date();
  let start: Date, end: Date;
  if (period === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (period === "yesterday") {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start = new Date(end);
    start.setDate(start.getDate() - 1);
  } else if (period === "weekly") {
    // Start from last Monday
    const day = now.getDay() || 7;
    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - day + 1
    );
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else {
    throw new Error("Invalid period");
  }
  return { start, end };
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userId = payload.userId;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly";
    const { start, end } = getPeriodRange(period);

    // Query finished tasks in the period
    const tasks = await Task.find({
      userId,
      createdAt: { $gte: start, $lt: end },
    });

    // Productivity time (sum of focusTime in hours)
    const productivityTime =
      tasks.reduce((sum, t) => sum + (t.focusTime || 0), 0) / 60; // assuming focusTime in minutes
    // Total finished tasks
    const totalTasks = tasks.length;

    // Chart data
    let chartLabels: string[] = [];
    let chartData: number[] = [];
    if (period === "weekly") {
      // 7 days, group by day
      chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      chartData = Array(7).fill(0);
      tasks.forEach((t) => {
        const d = new Date(t.createdAt);
        let day = d.getDay();
        day = day === 0 ? 6 : day - 1; // Monday=0, Sunday=6
        chartData[day] += (t.focusTime || 0) / 60;
      });
    } else {
      // 6 blocks: 00-04, 04-08, ..., 20-24
      chartLabels = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
      chartData = Array(6).fill(0);
      tasks.forEach((t) => {
        const d = new Date(t.createdAt);
        const hour = d.getHours();
        const idx = Math.floor(hour / 4);
        chartData[idx] += (t.focusTime || 0) / 60;
      });
    }

    return NextResponse.json({
      productivityTime: productivityTime.toFixed(1),
      totalTasks,
      chartLabels,
      chartData,
    });
  } catch (e) {
    console.error("Report error:", e);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
