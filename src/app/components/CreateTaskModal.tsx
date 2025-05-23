"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const FOCUS_TIME_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];
const CYCLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

// Default constants
const DEFAULT_PRIORITY = "Medium";
const DEFAULT_DUE_DATE = new Date();

function ModalWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl bg-[#232336] shadow-2xl p-0 pb-6 animate-fade-in z-50">
        <div className="flex flex-col items-center pt-4">
          <div className="w-16 h-1.5 rounded-full bg-[#39395a] mb-4" />
        </div>
        {children}
      </div>
    </div>
  );
}

function WheelPickerModal({
  title,
  options,
  value,
  onSelect,
  onClose,
  formatOption,
}: {
  title: string;
  options: any[];
  value: any;
  onSelect: (v: any) => void;
  onClose: () => void;
  formatOption?: (v: any) => string;
}) {
  const [selected, setSelected] = useState(value);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (listRef.current) {
      const idx = options.findIndex((v) => v === selected);
      if (idx >= 0) {
        const itemHeight = 48;
        const containerHeight = 144;
        const scrollPosition =
          idx * itemHeight - containerHeight / 2 + itemHeight / 2;

        listRef.current.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selected, options]);

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex flex-col items-center px-6">
        <h2 className="text-white text-xl font-bold mb-6">{title}</h2>
        <div className="relative w-full flex flex-col items-center mb-8">
          {/* <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 rounded-2xl bg-[#39395a]/40 pointer-events-none z-10" /> */}
          <div
            ref={listRef}
            className="w-full h-[144px] overflow-y-auto scroll-smooth flex flex-col items-center py-[60px] gap-2 snap-y snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {options.map((opt, i) => {
              const isActive = opt === selected;
              return (
                <button
                  key={opt}
                  className={`w-full h-12 flex items-center justify-center rounded-2xl text-lg font-semibold snap-center transition-all ${
                    isActive ? "text-white" : "text-[#6c6c8a]"
                  }`}
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  onClick={() => setSelected(opt)}
                >
                  {formatOption ? formatOption(opt) : opt}
                </button>
              );
            })}
          </div>
        </div>
        <button
          className="w-full bg-[#7B61FF] text-white font-semibold rounded-full py-3 text-lg"
          onClick={() => {
            onSelect(selected);
            onClose();
          }}
        >
          Save
        </button>
      </div>
    </ModalWrapper>
  );
}

function CalendarModal({
  value,
  onSelect,
  onClose,
}: {
  value: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}) {
  // Simple calendar for current month
  const [month, setMonth] = useState(new Date(value));
  const [tempSelected, setTempSelected] = useState(value);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
  const handlePrev = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const handleNext = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex flex-col items-center px-6">
        <h2 className="text-white text-xl font-bold mb-4">Due Date</h2>
        <div className="flex justify-between w-full mb-2">
          <button className="text-[#7B61FF] text-lg" onClick={handlePrev}>
            {"<"}
          </button>
          <span className="text-white font-semibold">
            {month.toLocaleString("default", { month: "long" })}{" "}
            {month.getFullYear()}
          </span>
          <button className="text-[#7B61FF] text-lg" onClick={handleNext}>
            {">"}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 w-full mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="text-[#6c6c8a] text-xs text-center">
              {d}
            </span>
          ))}
          {Array(firstDay)
            .fill(0)
            .map((_, i) => (
              <span key={`empty-${i}`}></span>
            ))}
          {Array(daysInMonth)
            .fill(0)
            .map((_, i) => {
              const date = new Date(
                month.getFullYear(),
                month.getMonth(),
                i + 1
              );
              const isSelected = isSameDay(date, tempSelected);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={`day-${i}`}
                  className={`aspect-square w-8 rounded-full text-sm font-semibold ${
                    isSelected
                      ? "bg-[#7B61FF] text-white"
                      : isToday
                      ? "border border-[#7B61FF] text-[#7B61FF]"
                      : "text-[#b3b3c5]"
                  }`}
                  onClick={() => setTempSelected(date)}
                >
                  {i + 1}
                </button>
              );
            })}
        </div>
        <button
          className="w-full bg-[#7B61FF] text-white font-semibold rounded-full py-3 text-lg"
          onClick={() => {
            onSelect(tempSelected);
            onClose();
          }}
        >
          Save
        </button>
      </div>
    </ModalWrapper>
  );
}

function formatDateLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const CreateTaskModal = ({
  open,
  onClose,
  initialTask,
  modalTitle,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initialTask?: {
    _id?: string;
    name: string;
    focusTime: number;
    cycle: number;
    dueDate: Date;
    priority: string;
  } | null;
  modalTitle?: string;
  onSaved?: () => void;
}) => {
  // Simpan default due date saat modal dibuka (untuk add mode)
  const defaultDueDate = useRef<Date>(DEFAULT_DUE_DATE);
  const [defaultFocusTime, setDefaultFocusTime] = useState(25);
  const [defaultCycle, setDefaultCycle] = useState(4);

  // Fetch settings saat modal add new dibuka
  useEffect(() => {
    if (!initialTask && open) {
      const fetchSettings = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/settings", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setDefaultFocusTime(data.focus || 25);
            setDefaultCycle(data.cycle || 4);
          }
        } catch {}
      };
      fetchSettings();
    }
  }, [initialTask, open]);

  const [taskName, setTaskName] = useState(initialTask?.name || "");
  const [focusTime, setFocusTime] = useState(
    initialTask?.focusTime || defaultFocusTime
  );
  const [cycle, setCycle] = useState(initialTask?.cycle || defaultCycle);
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate
      ? new Date(initialTask.dueDate)
      : defaultDueDate.current
  );
  const [priority, setPriority] = useState(
    initialTask?.priority || DEFAULT_PRIORITY
  );
  const [dropdown, setDropdown] = useState<
    null | "focus" | "cycle" | "priority" | "date"
  >(null);
  const [loadingSave, setLoadingSave] = useState(false);

  // Reset state setiap kali modal dibuka (add new)
  useEffect(() => {
    if (initialTask) {
      setTaskName(initialTask.name || "");
      setFocusTime(initialTask.focusTime || defaultFocusTime);
      setCycle(initialTask.cycle || defaultCycle);
      setDueDate(
        initialTask.dueDate
          ? new Date(initialTask.dueDate)
          : defaultDueDate.current
      );
      setPriority(initialTask.priority || DEFAULT_PRIORITY);
    } else if (open) {
      const now = new Date();
      defaultDueDate.current = now;
      setTaskName("");
      setFocusTime(defaultFocusTime);
      setCycle(defaultCycle);
      setDueDate(now);
      setPriority(DEFAULT_PRIORITY);
    }
  }, [initialTask, open, defaultFocusTime, defaultCycle]);

  // Cek perubahan (dirty)
  const isDirty = initialTask
    ? (initialTask.name || "") !== taskName ||
      (initialTask.focusTime || defaultFocusTime) !== focusTime ||
      (initialTask.cycle || defaultCycle) !== cycle ||
      (initialTask.priority || DEFAULT_PRIORITY) !== priority ||
      (initialTask.dueDate
        ? new Date(initialTask.dueDate).toISOString()
        : defaultDueDate.current.toISOString()) !== dueDate.toISOString()
    : taskName !== "" ||
      focusTime !== defaultFocusTime ||
      cycle !== defaultCycle ||
      priority !== DEFAULT_PRIORITY ||
      dueDate.toISOString() !== defaultDueDate.current.toISOString();

  // Handler Save
  const handleSave = async () => {
    setLoadingSave(true);
    const token = localStorage.getItem("token");
    const payload = {
      name: taskName,
      focusTime,
      cycle,
      dueDate,
      priority,
    };
    try {
      if (initialTask && initialTask._id) {
        // Edit
        await fetch(`/api/tasks/${initialTask._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Add new
        await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      alert("Failed to save task");
    } finally {
      setLoadingSave(false);
    }
  };

  if (!open) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex flex-col items-center px-6">
        <h2 className="text-white text-xl font-bold mb-6">
          {modalTitle || "Create New Task"}
        </h2>
        <input
          className="w-full bg-[#39395a] text-white rounded-xl px-4 py-3 mb-6 outline-none placeholder-[#b3b3c5] font-semibold"
          placeholder="Type your task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <div className="w-full flex flex-col gap-3 mb-8">
          <button
            className="w-full flex items-center justify-between bg-[#2D2C3F] rounded-xl px-4 py-3"
            onClick={() => setDropdown("focus")}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Image src="/timer.svg" alt="timer" width={20} height={20} />{" "}
              Focus Time
            </span>
            <span className="flex items-center gap-1 font-normal">
              <span>{focusTime} min</span>{" "}
              <Image src="/arrow-down.svg" alt="arrow" width={18} height={18} />
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between bg-[#2D2C3F] rounded-xl px-4 py-3"
            onClick={() => setDropdown("cycle")}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Image src="/timer.svg" alt="timer" width={20} height={20} />{" "}
              Pomodoro cycle
            </span>
            <span className="flex items-center gap-1 font-normal">
              <span>{cycle} cycle</span>{" "}
              <Image src="/arrow-down.svg" alt="arrow" width={18} height={18} />
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between bg-[#2D2C3F] rounded-xl px-4 py-3"
            onClick={() => setDropdown("date")}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Image
                src="/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />{" "}
              Due date
            </span>
            <span className="flex items-center gap-1 font-normal">
              <span>{formatDateLabel(dueDate)}</span>{" "}
              <Image src="/arrow-down.svg" alt="arrow" width={18} height={18} />
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between bg-[#2D2C3F] rounded-xl px-4 py-3"
            onClick={() => setDropdown("priority")}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Image src="/flag.svg" alt="flag" width={20} height={20} />{" "}
              Priority
            </span>
            <span className="flex items-center gap-1 font-normal">
              <span>{priority}</span>{" "}
              <Image src="/arrow-down.svg" alt="arrow" width={18} height={18} />
            </span>
          </button>
        </div>
        <div className="w-full flex justify-between gap-4">
          {isDirty && (
            <>
              <button
                className="flex-1 py-3 rounded-full text-white font-semibold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-full bg-[#7B61FF] text-white font-semibold"
                onClick={handleSave}
                disabled={loadingSave}
              >
                {loadingSave ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {dropdown === "focus" && (
        <WheelPickerModal
          title="Focus Time"
          options={FOCUS_TIME_OPTIONS}
          value={focusTime}
          onSelect={(v) => setFocusTime(v)}
          onClose={() => setDropdown(null)}
          formatOption={(v) => `${v} min`}
        />
      )}
      {dropdown === "cycle" && (
        <WheelPickerModal
          title="Pomodoro Cycle"
          options={CYCLE_OPTIONS}
          value={cycle}
          onSelect={(v) => setCycle(v)}
          onClose={() => setDropdown(null)}
        />
      )}
      {dropdown === "priority" && (
        <WheelPickerModal
          title="Priority"
          options={PRIORITY_OPTIONS}
          value={priority}
          onSelect={(v) => setPriority(v)}
          onClose={() => setDropdown(null)}
        />
      )}
      {dropdown === "date" && (
        <CalendarModal
          value={dueDate}
          onSelect={(d) => setDueDate(d)}
          onClose={() => setDropdown(null)}
        />
      )}
    </ModalWrapper>
  );
};

export default CreateTaskModal;
export { WheelPickerModal };
