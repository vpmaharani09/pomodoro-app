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

const PRIORITY_COLOR = {
  High: "#D47D7D",
  Medium: "#E3D47D",
  Low: "#7DD4A0",
};

const PomoTimer = ({
  activeTask,
  setActiveTask,
  setActiveMenu,
}: {
  activeTask?: any;
  setActiveTask?: (task: any) => void;
  setActiveMenu?: (menu: string) => void;
}) => {
  // Settings state
  const [userSettings, setUserSettings] = useState({
    focus: 25,
    short: 5,
    long: 15,
    cycle: 4,
  });
  // State
  const [state, setState] = useState<StateType>("INITIAL_FOCUS_TIME");
  const [hasTask, setHasTask] = useState(false);
  const [taskName, setTaskName] = useState("Create a Design Wireframe");
  const [timer, setTimer] = useState(25 * 60); // default 25 min
  const [cycle, setCycle] = useState(1);
  const [maxCycle, setMaxCycle] = useState(4);
  const [breakType, setBreakType] = useState<BreakType>("short");
  const [showToast, setShowToast] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Ref untuk mendeteksi perubahan task
  const lastTaskId = useRef<string | null>(null);

  // Fetch settings saat mount atau saat activeTask berubah ke null
  useEffect(() => {
    if (!activeTask) {
      const fetchSettings = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/settings", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            console.log("TEST", data);
            setUserSettings({
              focus: data.focus || 25,
              short: data.short || 5,
              long: data.long || 15,
              cycle: data.cycle || 4,
            });
            setTimer((data.focus || 25) * 60);
            setMaxCycle(data.cycle || 4);
          }
        } catch {}
      };
      fetchSettings();
    }
  }, [activeTask]);

  // Sync with activeTask from parent
  useEffect(() => {
    // Cek apakah benar-benar pindah ke task baru
    const currentTaskId = activeTask?._id || null;
    if (lastTaskId.current === currentTaskId) {
      // Task sama, jangan reset timer
      return;
    }
    lastTaskId.current = currentTaskId;

    // Reset localStorage timer saat ganti task
    localStorage.removeItem("pomo_timer_value");
    localStorage.removeItem("pomo_timer_state");
    localStorage.removeItem("pomo_timer_timestamp");

    if (activeTask) {
      setHasTask(true);
      setTaskName(activeTask.name);
      setState("INITIAL_FOCUS_TIME");
      const t = (activeTask.focusTime || userSettings.focus) * 60;
      setTimer(t);
      setMaxCycle(activeTask.cycle || userSettings.cycle);
      // Simpan timer baru ke localStorage
      localStorage.setItem("pomo_timer_value", t.toString());
      localStorage.setItem("pomo_timer_state", "INITIAL_FOCUS_TIME");
      localStorage.setItem("pomo_timer_timestamp", Date.now().toString());
    } else {
      setHasTask(false);
      setState("INITIAL_FOCUS_TIME");
      setCycle(1);
      const t = (userSettings.focus || 25) * 60;
      setTimer(t);
      setMaxCycle(userSettings.cycle || 4);
      localStorage.setItem("pomo_timer_value", t.toString());
      localStorage.setItem("pomo_timer_state", "INITIAL_FOCUS_TIME");
      localStorage.setItem("pomo_timer_timestamp", Date.now().toString());
    }
  }, [activeTask]);

  // Jika userSettings berubah dan tidak ada activeTask, update timer
  useEffect(() => {
    if (!activeTask) {
      setTimer((userSettings.focus || 25) * 60);
      setMaxCycle(userSettings.cycle || 4);
    }
  }, [userSettings]);

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
          setTimer((userSettings.long || 15) * 60);
        } else {
          setBreakType("short");
          setState("INITIAL_BREAK_TIME");
          setTimer((userSettings.short || 5) * 60);
        }
      } else if (state === "RUNNING_BREAK") {
        if (breakType === "long") {
          // Selesai long break, reset cycle & toast
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          setCycle(1);
          setState("INITIAL_FOCUS_TIME");
          setTimer(
            (activeTask ? activeTask.focusTime : userSettings.focus) * 60
          );
        } else {
          // Selesai short break, lanjut focus berikutnya
          setCycle((c) => c + 1);
          setState("INITIAL_FOCUS_TIME");
          setTimer(
            (activeTask ? activeTask.focusTime : userSettings.focus) * 60
          );
        }
      }
    }
  }, [timer, state, breakType, cycle, maxCycle, userSettings, activeTask]);

  // Restore timer & state dari localStorage saat mount (dengan timestamp)
  useEffect(() => {
    const saved = localStorage.getItem("pomo_timer_value");
    const savedState = localStorage.getItem("pomo_timer_state");
    const savedTimestamp = localStorage.getItem("pomo_timer_timestamp");
    if (saved && savedState && savedTimestamp) {
      let restoredTimer = Number(saved);
      // Only restore the timer value, but set state to INITIAL_FOCUS_TIME
      setTimer(restoredTimer);
      setState("INITIAL_FOCUS_TIME");
    }
  }, []);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear timer state when leaving the page
      localStorage.removeItem("pomo_timer_value");
      localStorage.removeItem("pomo_timer_state");
      localStorage.removeItem("pomo_timer_timestamp");
    };
  }, []);

  // Simpan timer, state, dan timestamp ke localStorage setiap kali berubah
  useEffect(() => {
    if (state === "RUNNING_FOCUS" || state === "RUNNING_BREAK") {
      localStorage.setItem("pomo_timer_value", timer.toString());
      localStorage.setItem("pomo_timer_state", state);
      localStorage.setItem("pomo_timer_timestamp", Date.now().toString());
    }
  }, [timer, state]);

  // Format detik ke mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Taskbar
  const renderTaskBar = () => {
    if (!hasTask) {
      return (
        <div
          className="w-full max-w-[340px] bg-[#6C4EC6] rounded-xl flex items-center px-6 py-3 mb-8 gap-3 cursor-pointer"
          onClick={() => setShowCreateTask(true)}
        >
          <span className="text-white text-base flex-1">Create new task</span>
          <span className="flex items-center">
            <Image src="/edit-2.svg" alt="edit" width={24} height={24} />
          </span>
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
        <button
          className="bg-none border-none cursor-pointer p-0 flex items-center"
          onClick={() => {
            if (setActiveTask) {
              setActiveTask(null);
            }
            setState("INITIAL_FOCUS_TIME");
            setTimer(userSettings.focus * 60);
            setCycle(1);
            // Clear localStorage
            localStorage.removeItem("pomo_timer_value");
            localStorage.removeItem("pomo_timer_state");
            localStorage.removeItem("pomo_timer_timestamp");
          }}
        >
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
      let total = activeTask
        ? activeTask.focusTime * 60
        : userSettings.focus * 60;
      if (state === "RUNNING_BREAK" || state === "INITIAL_BREAK_TIME") {
        total =
          breakType === "long"
            ? (userSettings.long || 15) * 60
            : (userSettings.short || 5) * 60;
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
              ? activeTask
                ? `${String(activeTask.focusTime).padStart(2, "0")}:00`
                : `${String(userSettings.focus).padStart(2, "0")}:00`
              : breakType === "long"
              ? `${String(userSettings.long).padStart(2, "0")}:00`
              : `${String(userSettings.short).padStart(2, "0")}:00`}
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
              setTimer(
                (activeTask ? activeTask.focusTime : userSettings.focus) * 60
              );
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
                setTimer(
                  (activeTask ? activeTask.focusTime : userSettings.focus) * 60
                );
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
              setTimer(
                breakType === "long"
                  ? userSettings.long * 60
                  : userSettings.short * 60
              );
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
              setTimer(userSettings.focus * 60);
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
        initialTask={null}
        modalTitle={"Create New Task"}
        onSaved={() => {
          setShowCreateTask(false);
          setActiveMenu && setActiveMenu("Manage");
        }}
      />
    </>
  );
};

export default PomoTimer;
