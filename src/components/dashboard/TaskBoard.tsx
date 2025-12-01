import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  assignee?: {
    name: string;
    avatar: string;
  };
}

interface TaskBoardProps {
  tasks?: Task[];
  onTaskMove?: (taskId: string, newStatus: Task["status"]) => void;
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
  isLoading?: boolean;
}

const defaultTasks: Task[] = [
  // ... (same as before)
];

const TaskBoard = ({
  tasks = defaultTasks,
  onTaskMove = () => {},
  onTaskClick = () => {},
  onAddTask,
  isLoading = false,
}: TaskBoardProps) => {
  const [loading, setLoading] = useState(isLoading);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "bg-gray-50",
      borderColor: "border-gray-200",
      highlight: "bg-gray-100",
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "bg-blue-50",
      borderColor: "border-blue-100",
      highlight: "bg-blue-100",
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-50",
      borderColor: "border-green-100",
      highlight: "bg-green-100",
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onTaskMove(taskId, status);
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Task Board
          </h2>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Add Task</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 h-[calc(100%-4rem)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-3 sm:p-4 border ${column.borderColor}`}
            >
              <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${column.id === "todo" ? "bg-gray-400" : column.id === "in-progress" ? "bg-blue-400" : "bg-green-400"}`}
                ></span>
                {column.title}
              </h3>
              <div className="space-y-3 flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px]">
                <div className="relative">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-blue-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-3 text-center">
                  Loading tasks...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Task Board
        </h2>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors mobile-tap-target"
          onClick={() => onAddTask?.()}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden xs:inline">Add Task</span>
          <span className="xs:hidden">Add</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 h-[calc(100%-4rem)]">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-3 sm:p-4 border ${dragOverColumn === column.id ? column.highlight : column.borderColor} transition-colors duration-200 min-h-[200px]`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id as Task["status"])}
            >
              <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${column.id === "todo" ? "bg-gray-400" : column.id === "in-progress" ? "bg-blue-400" : "bg-green-400"}`}
                ></span>
                {column.title}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({columnTasks.length})
                </span>
              </h3>
              <div className="space-y-3">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layoutId={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className={
                        draggedTaskId === task.id ? "opacity-50" : "opacity-100"
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 rounded-xl border-0 bg-white shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        {task.assignee && (
                          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-7 h-7 rounded-full mr-2 border border-white shadow-sm"
                            />
                            <span className="text-sm text-gray-700 font-medium truncate">
                              {task.assignee.name}
                            </span>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm mb-2">
                      No tasks in this column
                    </p>
                    <p className="text-gray-400 text-xs">
                      Drag tasks here or add new tasks
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
