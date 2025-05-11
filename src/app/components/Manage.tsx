import Image from "next/image";
import React, { useState, useEffect } from "react";
import CreateTaskModal from "@/app/components/CreateTaskModal";

const TASKS = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  name: `Create a Design Wireframe`,
  focusTime: 25,
  cycle: 2,
  dueDate: new Date(),
  priority: i % 3 === 0 ? "High" : i % 3 === 1 ? "Medium" : "Low",
}));

const PRIORITY_COLOR = {
  High: "#D47D7D",
  Medium: "#E3D47D",
  Low: "#7DD4A0",
};

type TaskType = (typeof TASKS)[number] & { _id?: string };

type ManageProps = {
  setActiveMenu: (m: string) => void;
  setActiveTask: (task: TaskType) => void;
};

const Manage = ({ setActiveMenu, setActiveTask }: ManageProps) => {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskSaved = () => {
    fetchTasks();
  };

  const handleCardClick = (task: TaskType) => {
    setSelectedTask(task);
    setShowCreateTask(true);
  };

  const handleCloseModal = () => {
    setShowCreateTask(false);
    setSelectedTask(null);
  };

  const handlePlay = (e: React.MouseEvent, task: TaskType) => {
    e.stopPropagation();
    setActiveTask(task);
    setActiveMenu("Pomodoro");
  };

  return (
    <div className="w-[100vw] max-w-[430px] h-screen mx-auto flex flex-col p-0 sm:rounded-none sm:w-full">
      {/* Header - Fixed */}
      <div className="text-white text-[1.3rem] font-bold text-center mb-4 mt-8 w-full px-8">
        Manage task
      </div>

      {/* Scrollable Area: Add Button + Task List */}
      <div className="flex-1 overflow-y-auto w-full px-8 pb-[100px]">
        {/* Sticky Button */}
        <div className="flex justify-center sticky top-0 z-20 pt-2 pb-4">
          <button
            className="w-full max-w-[340px] bg-[#7B61FF] text-white text-lg font-semibold rounded-xl py-4 flex items-center justify-between px-6 shadow-md gap-3"
            onClick={() => setShowCreateTask(true)}
          >
            <span>Add new task</span>
            <Image src="/edit-2.svg" alt="add" width={24} height={24} />
          </button>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-white">No tasks found.</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id || task._id}
                className="w-full max-w-[340px] bg-[#292945] rounded-xl flex items-center px-4 py-4 gap-4 mx-auto cursor-pointer"
                onClick={() => handleCardClick(task)}
              >
                <span
                  className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor:
                      PRIORITY_COLOR[
                        task.priority as keyof typeof PRIORITY_COLOR
                      ],
                  }}
                ></span>
                <div className="flex flex-col flex-1">
                  <span className="text-white font-semibold text-base mb-1">
                    {task.name}
                  </span>
                  <span className="flex items-center gap-2 text-[#b3b3c5] text-sm font-medium">
                    <Image
                      src="/timer.svg"
                      alt="timer"
                      width={18}
                      height={18}
                    />
                    {task.focusTime} min x {task.cycle}
                  </span>
                </div>
                <button
                  className="bg-none border-none cursor-pointer p-0 flex items-center"
                  onClick={(e) => handlePlay(e, task)}
                >
                  <Image
                    src="/play-circle.svg"
                    alt="play"
                    width={36}
                    height={36}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <CreateTaskModal
        open={showCreateTask}
        onClose={handleCloseModal}
        initialTask={selectedTask}
        modalTitle={selectedTask ? "Task Detail" : undefined}
        onSaved={handleTaskSaved}
      />
    </div>
  );
};

export default Manage;
