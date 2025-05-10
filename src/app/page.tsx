"use client";
import { useState } from "react";
import PomoTimer from "@/app/components/PomoTimer";
import Manage from "@/app/components/Manage";
import Report from "@/app/components/Report";
import Settings from "@/app/components/Settings";
import Image from "next/image";

function BottomNav({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: string;
  setActiveMenu: (m: string) => void;
}) {
  return (
    <div className="w-full max-w-[430px] sticky bottom-0 left-0 z-40 bg-[#232336] rounded-b-[32px] flex justify-center items-center mx-auto">
      <div className="w-full max-w-[340px] flex justify-between items-center pt-3 pb-6">
        <button
          className={`flex flex-col items-center text-sm gap-1 focus:outline-none`}
          style={{ color: activeMenu === "Pomodoro" ? "#7E7FD0" : "#2D2C3F" }}
          onClick={() => setActiveMenu("Pomodoro")}
        >
          <Image
            src="/timer.svg"
            alt="Pomodoro"
            width={24}
            height={24}
            style={{
              filter:
                activeMenu === "Pomodoro"
                  ? undefined
                  : "grayscale(1) brightness(0.7)",
            }}
          />
          <span>Pomodoro</span>
        </button>
        <button
          className={`flex flex-col items-center text-sm gap-1 focus:outline-none`}
          style={{ color: activeMenu === "Manage" ? "#7E7FD0" : "#2D2C3F" }}
          onClick={() => setActiveMenu("Manage")}
        >
          <Image
            src="/task-square.svg"
            alt="Manage"
            width={24}
            height={24}
            style={{
              filter:
                activeMenu === "Manage"
                  ? undefined
                  : "grayscale(1) brightness(0.7)",
            }}
          />
          <span>Manage</span>
        </button>
        <button
          className={`flex flex-col items-center text-sm gap-1 focus:outline-none`}
          style={{ color: activeMenu === "Report" ? "#7E7FD0" : "#2D2C3F" }}
          onClick={() => setActiveMenu("Report")}
        >
          <Image
            src="/diagram.svg"
            alt="Report"
            width={24}
            height={24}
            style={{
              filter:
                activeMenu === "Report"
                  ? undefined
                  : "grayscale(1) brightness(0.7)",
            }}
          />
          <span>Report</span>
        </button>
        <button
          className={`flex flex-col items-center text-sm gap-1 focus:outline-none`}
          style={{ color: activeMenu === "Settings" ? "#7E7FD0" : "#2D2C3F" }}
          onClick={() => setActiveMenu("Settings")}
        >
          <Image
            src="/setting-2.svg"
            alt="Settings"
            width={24}
            height={24}
            style={{
              filter:
                activeMenu === "Settings"
                  ? undefined
                  : "grayscale(1) brightness(0.7)",
            }}
          />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("Pomodoro");

  const renderContent = () => {
    switch (activeMenu) {
      case "Pomodoro":
        return <PomoTimer />;
      case "Manage":
        return <Manage />;
      case "Report":
        return <Report />;
      case "Settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[100vw] max-w-[430px] min-h-[100vh] mx-auto bg-[#232336] rounded-[32px] shadow-lg flex flex-col items-center relative sm:rounded-none sm:w-full">
      <div className="flex-1 w-full flex flex-col items-center pb-28">
        {renderContent()}
      </div>
      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}
