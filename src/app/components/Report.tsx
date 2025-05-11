"use client";
import { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image";

const TABS = ["today", "yesterday", "weekly"];
const TAB_LABELS = { today: "Today", yesterday: "Yesterday", weekly: "Weekly" };

const WEEKLY_BARS = [2, 5, 1, 7, 4, 2, 6]; // dummy hours per day
const HOURLY_BARS = [1, 2, 0, 3, 1, 2]; // dummy hours per 4-hour block
const WEEKLY_TASKS = [2, 3, 1, 4, 2, 3, 5]; // dummy tasks per day

const Report = () => {
  const [tab, setTab] = useState<"today" | "yesterday" | "weekly">("weekly");

  // Dummy summary data
  const summary =
    tab === "weekly" ? { time: "14h", tasks: 3 } : { time: "3h", tasks: 1 };

  // Bar chart data
  const bars = tab === "weekly" ? WEEKLY_BARS : HOURLY_BARS;
  const maxBar = Math.max(...bars, 1);
  const barLabels =
    tab === "weekly"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];

  // Productivity average x-axis labels and title
  const prodAvgLabels =
    tab === "weekly"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
  const prodAvgTitle =
    tab === "weekly"
      ? "Weekly Productivity Average"
      : "Daily Productivity Average";

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Appbar */}
      <div className="w-full max-w-[430px] px-6 pt-8">
        <h2 className="text-white text-[1.3rem] font-bold text-center mb-4">
          Report
        </h2>
        <div className="flex gap-3 mb-4 w-full">
          {TABS.map((t) => (
            <button
              key={t}
              className={`px-6 py-2 rounded-full border transition-all font-poppins text-[14px] font-medium ${
                tab === t
                  ? "bg-[#7B61FF] text-white border-[#7B61FF]"
                  : "bg-transparent text-white border-[#39395a]"
              }`}
              onClick={() => setTab(t as any)}
            >
              {TAB_LABELS[t as keyof typeof TAB_LABELS]}
            </button>
          ))}
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="flex w-full max-w-[430px] px-6 pb-32 overflow-y-auto flex-col items-center">
        {/* Summary Card */}
        <div className="w-full bg-[#232336] rounded-2xl flex items-center px-6 py-6 mb-6 gap-6">
          <div className="flex-shrink-0">
            <Image
              src="/profile.png"
              alt="profile"
              width={72}
              height={72}
              className="rounded-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-[14px] font-poppins">
                Productivity Time
              </span>
              <span className="text-white text-[16px] font-bold font-poppins">
                {summary.time}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[14px] font-poppins">
                Total Tasks
              </span>
              <span className="text-white text-[16px] font-bold font-poppins">
                {summary.tasks}
              </span>
            </div>
          </div>
        </div>
        {/* Bar Chart */}
        <div className="w-full bg-white rounded-2xl px-4 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#232336] text-[16px] font-bold font-poppins">
              {tab === "weekly" ? "Weekly Focus Overview" : "Focus Overview"}
            </span>
          </div>
          {/* Persentase dan range sejajar */}
          {tab === "weekly" && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#232336] text-[32px] font-bold font-poppins">
                +89%
              </span>
              <div className="flex items-center gap-2 border border-gray-200 text-black/70 rounded-full px-3 py-1 text-[12px] font-poppins">
                1/1/2024 - 7/1/2024
              </div>
            </div>
          )}
          <div className="flex items-end gap-3 h-32 w-full justify-between mt-2">
            {bars.map((val, i) => (
              <div key={i} className="flex flex-col items-center w-7">
                {/* Gray track */}
                <div className="relative w-full h-28 flex flex-col justify-end">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-full rounded-xl bg-[#ECECF2]" />
                  {/* Blue progress */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 rounded-xl bg-[#7B61FF] transition-all"
                    style={{ height: `${(val / maxBar) * 100}%`, minHeight: 8 }}
                  />
                </div>
                <span
                  className={`text-[#b3b3c5] mt-2 font-poppins ${
                    tab === "weekly" ? "text-[12px]" : "text-[10px]"
                  } whitespace-nowrap`}
                >
                  {barLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Productivity Average (dynamic area line chart) */}
        <div className="w-full bg-white rounded-2xl px-4 pt-4 pb-2 mb-2">
          <span className="text-[#b3b3c5] text-[16px] font-poppins block mb-1">
            {prodAvgTitle}
          </span>
          <span className="text-[#232336] text-[32px] font-bold font-poppins block mb-2">
            10 Tasks
          </span>
          {/* Dynamic area line chart */}
          <LineAreaChart
            data={[2, 3, 5, 4, 6, 3, 7].slice(0, prodAvgLabels.length)}
          />
          <div className="flex justify-between mt-2 px-2">
            {prodAvgLabels.map((d) => (
              <span
                key={d}
                className={`text-[#b3b3c5] ${
                  tab === "weekly" ? "text-[12px]" : "text-[10px]"
                } font-poppins whitespace-nowrap`}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function LineAreaChart({ data }: { data: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(180);
  const height = 60;
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setWidth(containerRef.current!.offsetWidth || 180);
    };
    handleResize();
    const ro = new (window as any).ResizeObserver(handleResize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 10) - 5;
    return [x, y];
  });
  const areaPath = [
    `M${points[0][0]},${height}`,
    ...points.map(([x, y]) => `L${x},${y}`),
    `L${points[points.length - 1][0]},${height}`,
    "Z",
  ].join(" ");
  const linePath = [
    `M${points[0][0]},${points[0][1]}`,
    ...points.slice(1).map(([x, y]) => `L${x},${y}`),
  ].join(" ");
  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        <defs>
          <linearGradient
            id="areaGradient2"
            x1="0"
            y1="0"
            x2="0"
            y2={height}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7B61FF" stopOpacity="0.25" />
            <stop offset="1" stopColor="#7B61FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient2)" />
        <path
          d={linePath}
          stroke="#7B61FF"
          strokeWidth={3}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default Report;
