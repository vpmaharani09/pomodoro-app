"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import WheelPickerModal secara dinamis agar tidak double render
const WheelPickerModal = dynamic(
  () => import("./CreateTaskModal").then((mod) => mod.WheelPickerModal),
  { ssr: false }
);

const FOCUS_TIME_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];
const BREAK_OPTIONS = [5, 10, 15, 20, 25, 30];
const CYCLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

const DEFAULTS = {
  focus: 25,
  short: 5,
  long: 15,
  cycle: 4,
};

const Settings = () => {
  const router = useRouter();
  // State untuk value awal (simulasi fetch dari backend)
  const [initial, setInitial] = useState(DEFAULTS);
  // State untuk value yang sedang diedit
  const [focus, setFocus] = useState(DEFAULTS.focus);
  const [short, setShort] = useState(DEFAULTS.short);
  const [long, setLong] = useState(DEFAULTS.long);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  // Modal dropdown
  const [dropdown, setDropdown] = useState<
    null | "focus" | "short" | "long" | "cycle"
  >(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setInitial(data);
        setFocus(data.focus);
        setShort(data.short);
        setLong(data.long);
        setCycle(data.cycle);
        console.log(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Cek perubahan
  const isChanged =
    focus !== initial.focus ||
    short !== initial.short ||
    long !== initial.long ||
    cycle !== initial.cycle;

  // Handler
  const handleCancel = () => {
    setFocus(initial.focus);
    setShort(initial.short);
    setLong(initial.long);
    setCycle(initial.cycle);
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ focus, short, long, cycle }),
      });
      console.log("ini res ", res);
      console.log(res);
      if (!res.ok) throw new Error("Failed to save settings");
      const data = await res.json();
      console.log("Result");
      console.log(data);
      setInitial(data);
    } catch (e: any) {
      console.log(e);
      setError(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="flex flex-col w-full h-full py-8">
      <div className="w-full max-w-[430px] px-6 pb-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <h2 className="text-white text-[1.3rem] font-bold">Settings</h2>
          <button
            className="bg-[#7B61FF] text-white font-medium font-poppins rounded-full px-6 py-2 text-[12px] shadow"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        {loading ? (
          <div className="text-white text-center py-10">
            Loading settings...
          </div>
        ) : (
          <>
            {/* Field */}
            <div className="w-full flex flex-col gap-6 mb-10">
              <button
                className="w-full flex items-center justify-between bg-[#232336] rounded-[32px] px-6 py-5 text-[14px] font-normal text-white focus:outline-none font-poppins"
                onClick={() => setDropdown("focus")}
              >
                <span className="font-normal text-white text-[14px] font-poppins">
                  Focus time
                </span>
                <span className="flex items-center gap-2 text-white font-normal text-[14px] font-poppins">
                  {focus} min
                  <img
                    src="/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                </span>
              </button>
              <button
                className="w-full flex items-center justify-between bg-[#232336] rounded-[32px] px-6 py-5 text-[14px] font-normal text-white focus:outline-none font-poppins"
                onClick={() => setDropdown("short")}
              >
                <span className="font-normal text-white text-[14px] font-poppins">
                  Short break
                </span>
                <span className="flex items-center gap-2 text-white font-normal text-[14px] font-poppins">
                  {short} min
                  <img
                    src="/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                </span>
              </button>
              <button
                className="w-full flex items-center justify-between bg-[#232336] rounded-[32px] px-6 py-5 text-[14px] font-normal text-white focus:outline-none font-poppins"
                onClick={() => setDropdown("long")}
              >
                <span className="font-normal text-white text-[14px] font-poppins">
                  Long break
                </span>
                <span className="flex items-center gap-2 text-white font-normal text-[14px] font-poppins">
                  {long} min
                  <img
                    src="/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                </span>
              </button>
              <button
                className="w-full flex items-center justify-between bg-[#232336] rounded-[32px] px-6 py-5 text-[14px] font-normal text-white focus:outline-none font-poppins"
                onClick={() => setDropdown("cycle")}
              >
                <span className="font-normal text-white text-[14px] font-poppins">
                  Pomodoro cycle
                </span>
                <span className="flex items-center gap-2 text-white font-normal text-[14px] font-poppins">
                  {cycle} cycle
                  <img
                    src="/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                </span>
              </button>
            </div>
            {/* Tombol Cancel & Save */}
            {isChanged && (
              <div className="w-full flex justify-between items-center mt-6 gap-4">
                <button
                  className="flex-1 py-4 rounded-full bg-transparent text-white font-semibold text-lg border-none"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-4 rounded-full bg-[#7B61FF] text-white font-semibold text-lg shadow"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}
          </>
        )}
      </div>
      {/* Modal Dropdown */}
      {dropdown === "focus" && (
        <WheelPickerModal
          title="Focus Time"
          options={FOCUS_TIME_OPTIONS}
          value={focus}
          onSelect={setFocus}
          onClose={() => setDropdown(null)}
          formatOption={(v) => `${v} min`}
        />
      )}
      {dropdown === "short" && (
        <WheelPickerModal
          title="Short Break"
          options={BREAK_OPTIONS}
          value={short}
          onSelect={setShort}
          onClose={() => setDropdown(null)}
          formatOption={(v) => `${v} min`}
        />
      )}
      {dropdown === "long" && (
        <WheelPickerModal
          title="Long Break"
          options={BREAK_OPTIONS}
          value={long}
          onSelect={setLong}
          onClose={() => setDropdown(null)}
          formatOption={(v) => `${v} min`}
        />
      )}
      {dropdown === "cycle" && (
        <WheelPickerModal
          title="Pomodoro Cycle"
          options={CYCLE_OPTIONS}
          value={cycle}
          onSelect={setCycle}
          onClose={() => setDropdown(null)}
          formatOption={(v) => `${v} cycle`}
        />
      )}
    </div>
  );
};

export default Settings;
