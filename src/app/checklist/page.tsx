"use client";

import React, { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, ListTodo, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function ChecklistPage() {
  // --- State ---
  const [title, setTitle] = useState("App Build Checklist");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Design frontend screens", completed: true },
    { id: "2", text: "Set up backend APIs", completed: false },
    { id: "3", text: "Add Google Login", completed: false },
    { id: "4", text: "Integrate Google Maps", completed: false },
    { id: "5", text: "Final testing", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");

  // --- Handlers ---

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };

    // Add to top of list (keep insertion order)
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Phone Frame Container - Reused Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-[430px] aspect-[9/16] bg-slate-950 rounded-[3rem] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col ring-1 ring-white/10"
        style={{ boxShadow: "0 0 60px -15px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.8)" }}
      >
        {/* Glossy Reflection Overlay */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

        {/* Content Container */}
        <div className="flex flex-col h-full w-full relative z-20 text-slate-100">
          
          {/* Top Section: Header */}
          <div className="flex-none pt-8 pb-4 px-6 flex flex-col items-center justify-center border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm z-30">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-medium text-slate-400 mb-1">
              <ListTodo className="w-3 h-3" />
              <span>BUILD-IN-A-DAY</span>
            </div>
            {/* Editable Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-xl font-bold text-white tracking-tight text-center w-full outline-none border-b border-transparent hover:border-slate-700 focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              placeholder="Checklist Title"
            />
          </div>

          {/* Middle Section: Scrollable Task List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="flex flex-col space-y-3 pb-20"> {/* pb-20 for bottom input spacing */}
              <AnimatePresence initial={false} mode="popLayout">
                {tasks.map((task, index) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onToggle={() => toggleTask(task.id)} 
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </AnimatePresence>
              
              {tasks.length === 0 && (
                <div className="text-center py-10 text-slate-600 text-sm">
                  No tasks yet. Add one below!
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Add Task Input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-40">
             <div className="flex items-center gap-3">
               <input
                 type="text"
                 value={newTaskText}
                 onChange={(e) => setNewTaskText(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Add a new task..."
                 className="flex-1 bg-slate-800/50 text-white placeholder:text-slate-500 px-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
               />
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleAddTask}
                 disabled={!newTaskText.trim()}
                 className="flex items-center justify-center w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 <Plus className="w-6 h-6" />
               </motion.button>
             </div>
             {/* Home Indicator */}
             <div className="flex justify-center mt-4 mb-1">
                <div className="w-32 h-1 bg-slate-700 rounded-full opacity-50" />
             </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// --- Subcomponents ---

function TaskItem({ 
  task, 
  index,
  onToggle,
  onDelete
}: { 
  task: Task; 
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        backgroundColor: task.completed ? "rgba(15, 23, 42, 0.4)" : "rgba(15, 23, 42, 0.7)" 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-2xl border border-slate-800/50 select-none relative overflow-hidden",
        task.completed ? "border-slate-800/30" : "border-slate-700/50 shadow-sm"
      )}
    >
      {/* Selection Checkbox Area */}
      <div 
        className="flex items-center gap-3 cursor-pointer flex-none"
        onClick={onToggle}
      >
        {/* Number */}
        <span className={cn(
          "text-xs font-mono font-bold w-4 text-right transition-colors",
          task.completed ? "text-slate-600" : "text-slate-400 group-hover:text-emerald-500"
        )}>
          {index + 1}.
        </span>

        {/* Checkbox */}
        <div className="relative flex-none w-6 h-6">
          <motion.div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              task.completed 
                ? "bg-emerald-500 border-emerald-500" 
                : "border-slate-500 group-hover:border-emerald-400"
            )}
            initial={false}
            animate={{ scale: task.completed ? 1.1 : 1 }}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Task Text */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onToggle}
      >
        <motion.span
          className={cn(
            "block text-base font-medium leading-tight truncate transition-colors",
            task.completed ? "text-slate-500 line-through decoration-slate-600" : "text-slate-100"
          )}
        >
          {task.text}
        </motion.span>
      </div>

      {/* Delete Button */}
      <motion.button
        whileHover={{ scale: 1.1, color: "#ef4444" }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex-none p-2 text-slate-600 hover:bg-slate-800 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>

      {/* Subtle flash effect on complete */}
      {task.completed && (
        <motion.div
           initial={{ x: "-100%", opacity: 0 }}
           animate={{ x: "200%", opacity: [0, 0.1, 0] }}
           transition={{ duration: 0.6, ease: "easeInOut" }}
           className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}
