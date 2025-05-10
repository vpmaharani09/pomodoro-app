"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import CreateTaskModal from "@/app/components/CreateTaskModal";

// State enums
const STATES = {
  INITIAL_FOCUS_TIME: "INITIAL_FOCUS_TIME",
  INITIAL_BREAK_TIME: "INITIAL_BREAK_TIME",
  RUNNING_FOCUS: "RUNNING_FOCUS",
  RUNNING_BREAK: "RUNNING_BREAK",
  PAUSE_FOCUS: "PAUSE_FOCUS",
};

type StateType = keyof typeof STATES;

type BreakType = "short" | "long";

const FOCUS_DURATION = 5 * 60; // 5 menit
const SHORT_BREAK = 1 * 60; // 1 menit
const LONG_BREAK = 3 * 60; // 3 menit
const DEFAULT_CYCLE = 2;

const PRIORITY_COLOR = {
  High: "#D47D7D",
  Medium: "#E3D47D",
  Low: "#7DD4A0",
};

const PomoTimer = ({
  activeTask,
  setActiveTask,
}: {
  activeTask?: any;
  setActiveTask?: (task: any) => void;
}) => {
  // State
  const [state, setState] = useState<StateType>("INITIAL_FOCUS_TIME");
  const [hasTask, setHasTask] = useState(false);
  const [taskName, setTaskName] = useState("Create a Design Wireframe");
  const [timer, setTimer] = useState(FOCUS_DURATION);
  const [cycle, setCycle] = useState(1);
  const [maxCycle, setMaxCycle] = useState(DEFAULT_CYCLE);
  const [breakType, setBreakType] = useState<BreakType>("short");
  const [showToast, setShowToast] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format detik ke mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Timer berjalan mundur
  useEffect(() => {
    if (state === "RUNNING_FOCUS" || state === "RUNNING_BREAK") {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state]);

  // Transisi otomatis saat timer habis
  useEffect(() => {
    if (timer === 0) {
      if (state === "RUNNING_FOCUS") {
        // Selesai focus, masuk break
        if (cycle === maxCycle) {
          setBreakType("long");
          setState("INITIAL_BREAK_TIME");
          setTimer(LONG_BREAK);
        } else {
          setBreakType("short");
          setState("INITIAL_BREAK_TIME");
          setTimer(SHORT_BREAK);
        }
      } else if (state === "RUNNING_BREAK") {
        if (breakType === "long") {
          // Selesai long break, reset cycle & toast
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          setCycle(1);
          setState("INITIAL_FOCUS_TIME");
          setTimer(FOCUS_DURATION);
        } else {
          // Selesai short break, lanjut focus berikutnya
          setCycle((c) => c + 1);
          setState("INITIAL_FOCUS_TIME");
          setTimer(FOCUS_DURATION);
        }
      }
    }
  }, [timer, state, breakType, cycle, maxCycle]);

  // Sync with activeTask from parent
  useEffect(() => {
    if (activeTask) {
      setHasTask(true);
      setTaskName(activeTask.name);
      setState("INITIAL_FOCUS_TIME");
    } else {
      setHasTask(false);
    }
  }, [activeTask]);

  // Taskbar
  const renderTaskBar = () => {
    if (!hasTask) {
      return (
        <div className="w-full max-w-[340px] bg-[#6C4EC6] rounded-xl flex items-center px-6 py-3 mb-8 gap-3">
          <span className="text-white text-base flex-1">Create new task</span>
          <button
            className="bg-none border-none cursor-pointer p-0 flex items-center"
            onClick={() => setShowCreateTask(true)}
          >
            <Image src="/edit-2.svg" alt="edit" width={24} height={24} />
          </button>
        </div>
      );
    }
    const circleColor =
      activeTask && activeTask.priority
        ? PRIORITY_COLOR[activeTask.priority as keyof typeof PRIORITY_COLOR]
        : "#7B61FF";
    return (
      <div className="w-full max-w-[340px] bg-[#292945] rounded-xl flex items-center px-4 py-3 mb-8 gap-3">
        <span
          className="w-5 h-5 border-2 rounded-full inline-block"
          style={{ borderColor: circleColor }}
        ></span>
        <span className="text-white text-base font-semibold flex-1">
          {taskName}
        </span>
        <button className="bg-none border-none cursor-pointer p-0 flex items-center">
          <Image
            src="/close-circle-outlined.svg"
            alt="close"
            width={24}
            height={24}
          />
        </button>
      </div>
    );
  };

  // Timer
  const renderTimer = () => {
    // Untuk progress bar lingkaran
    const getProgress = () => {
      let total = FOCUS_DURATION;
      if (state === "RUNNING_BREAK" || state === "INITIAL_BREAK_TIME") {
        total = breakType === "long" ? LONG_BREAK : SHORT_BREAK;
      }
      return timer / total;
    };
    const CIRCLE_LENGTH = 2 * Math.PI * 90; // r=90
    const progress = getProgress();
    const dashoffset = CIRCLE_LENGTH * (1 - progress);

    if (state === "INITIAL_FOCUS_TIME" || state === "INITIAL_BREAK_TIME") {
      return (
        <div className="mb-8 flex items-center justify-center w-[260px] h-[260px] sm:w-[200px] sm:h-[200px]">
          <div className="text-white text-4xl font-semibold z-10 relative text-center w-full">
            {state === "INITIAL_FOCUS_TIME"
              ? formatTime(FOCUS_DURATION)
              : breakType === "long"
              ? formatTime(LONG_BREAK)
              : formatTime(SHORT_BREAK)}
          </div>
        </div>
      );
    }
    return (
      <div className="relative w-[260px] h-[260px] mb-8 flex items-center justify-center sm:w-[200px] sm:h-[200px]">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 200 200"
        >
          {/* Base track */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#3A3A5D"
            strokeWidth="16"
            fill="none"
          />
          {/* Progress bar */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#7B61FF"
            strokeWidth="16"
            fill="none"
            strokeDasharray={CIRCLE_LENGTH}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s linear",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>
        <div className="text-white text-4xl font-semibold z-10 relative text-center">
          {formatTime(timer)}
        </div>
      </div>
    );
  };

  // Button Area
  const renderButtonArea = () => {
    switch (state) {
      case "INITIAL_FOCUS_TIME":
        return (
          <button
            className="w-full max-w-[320px] bg-[#7B61FF] text-white text-lg font-semibold border-none rounded-[32px] py-4 mb-8 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors hover:bg-[#6a4eea]"
            onClick={() => {
              setTimer(FOCUS_DURATION);
              setState("RUNNING_FOCUS");
            }}
          >
            <Image src="/play.svg" alt="play" width={24} height={24} />
            Start focus time
          </button>
        );
      case "RUNNING_FOCUS":
        return (
          <button
            className="w-full max-w-[320px] border border-[#7B61FF] text-[#7B61FF] text-lg font-semibold rounded-[32px] py-4 mb-8 flex items-center justify-center gap-2 cursor-pointer bg-transparent hover:bg-[#2d2250]/40 transition-colors"
            onClick={() => setState("PAUSE_FOCUS")}
          >
            Pause
          </button>
        );
      case "PAUSE_FOCUS":
        return (
          <div className="w-full max-w-[340px] flex justify-between gap-4 mb-8">
            <button
              className="flex-1 bg-[#2d2250] text-[#7B61FF] text-lg font-semibold rounded-[32px] py-4 flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => {
                setTimer(FOCUS_DURATION);
                setState("INITIAL_FOCUS_TIME");
                setCycle(1);
              }}
            >
              Stop
            </button>
            <button
              className="flex-1 bg-[#7B61FF] text-white text-lg font-semibold rounded-[32px] py-4 flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => setState("RUNNING_FOCUS")}
            >
              Continue
            </button>
          </div>
        );
      case "INITIAL_BREAK_TIME":
        return (
          <button
            className="w-full max-w-[320px] bg-[#7B61FF] text-white text-lg font-semibold border-none rounded-[32px] py-4 mb-8 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors hover:bg-[#6a4eea]"
            onClick={() => {
              setTimer(breakType === "long" ? LONG_BREAK : SHORT_BREAK);
              setState("RUNNING_BREAK");
            }}
          >
            <Image src="/play.svg" alt="play" width={24} height={24} />
            {breakType === "long" ? "Start long break" : "Start short break"}
          </button>
        );
      case "RUNNING_BREAK":
        return (
          <button
            className="w-full max-w-[320px] border border-[#7B61FF] text-[#7B61FF] text-lg font-semibold rounded-[32px] py-4 mb-8 flex items-center justify-center gap-2 cursor-pointer bg-transparent hover:bg-[#2d2250]/40 transition-colors"
            onClick={() => {
              setTimer(FOCUS_DURATION);
              setState("INITIAL_FOCUS_TIME");
              if (breakType === "long") {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setCycle(1);
              }
            }}
          >
            {breakType === "long" ? "Skip long break" : "Skip short break"}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-[100vw] max-w-[430px] h-full mx-auto p-8 pt-8 pb-4 flex flex-col items-center relative sm:rounded-none sm:w-full sm:p-3">
        <div className="text-white text-[1.3rem] font-bold text-center mb-6 mt-5">
          Pomodoro timer
        </div>
        {renderTaskBar()}
        {renderTimer()}
        {renderButtonArea()}
        {showToast && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-24 bg-[#7B61FF] text-white px-6 py-3 rounded-2xl shadow-lg font-semibold text-base z-50 animate-fade-in">
            Yey kamu sudah berhasil fokus
          </div>
        )}
      </div>
      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </>
  );
};

export default PomoTimer;
