import { useEffect, useState } from "react";
import { CheckSquare, Square, Trash2, X, Calendar, User, AlertCircle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { useAgentStore } from "../store/useAgentStore";
import { formatMessageTime } from "../lib/utils";

const TaskManagerModal = ({ isOpen, onClose }) => {
  const { tasks, isTasksLoading, getTasks, toggleTask, deleteTask } = useAgentStore();
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  useEffect(() => {
    if (isOpen) {
      getTasks();
    }
  }, [isOpen, getTasks]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "badge-error text-white font-semibold";
      case "medium":
        return "badge-warning text-black font-semibold";
      case "low":
        return "badge-info text-white font-semibold";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-base-100 border border-base-300 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <ListTodo className="size-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                Action Items & Tasks
                <span className="badge badge-sm badge-primary">{tasks.length}</span>
              </h2>
              <p className="text-xs text-base-content/60">Extracted automatically from your conversation history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 border-b border-base-300 flex items-center justify-between bg-base-100 px-4">
          <div className="join border border-base-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter("all")}
              className={`join-item btn btn-xs ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`join-item btn btn-xs ${filter === "pending" ? "btn-primary" : "btn-ghost"}`}
            >
              Pending ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`join-item btn btn-xs ${filter === "completed" ? "btn-primary" : "btn-ghost"}`}
            >
              Completed ({tasks.filter((t) => t.completed).length})
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isTasksLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-base-content/60 gap-2">
              <Clock className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading your task items...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-base-content/60 space-y-2">
              <CheckCircle2 className="size-12 mx-auto text-emerald-500/50" />
              <p className="text-base font-medium">No tasks found</p>
              <p className="text-xs text-base-content/50">
                {filter === "all"
                  ? "Ask the AI Agent to 'extract action items from my chats' to generate tasks automatically!"
                  : `No ${filter} tasks right now.`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  task.completed
                    ? "bg-base-200/30 border-base-300/50 opacity-60"
                    : "bg-base-100 border-base-300 shadow-sm hover:border-primary/40"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task._id)}
                  className="mt-0.5 text-base-content/60 hover:text-primary transition-colors"
                  title={task.completed ? "Mark as pending" : "Mark as completed"}
                >
                  {task.completed ? (
                    <CheckSquare className="size-5 text-emerald-500" />
                  ) : (
                    <Square className="size-5" />
                  )}
                </button>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm font-semibold leading-snug ${
                        task.completed ? "line-through text-base-content/60" : "text-base-content"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span className={`badge badge-xs uppercase text-[10px] shrink-0 ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority || "medium"}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-base-content/75 mt-1 leading-relaxed">{task.description}</p>
                  )}

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-base-content/60">
                    {task.assignee && (
                      <span className="flex items-center gap-1 bg-base-200 px-2 py-0.5 rounded text-xs font-medium">
                        <User className="size-3 text-primary" />
                        {task.assignee}
                      </span>
                    )}

                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs">
                        <Calendar className="size-3 text-amber-500" />
                        Due: {task.dueDate}
                      </span>
                    )}

                    {task.sourceConversation && (
                      <span className="text-[10px] text-base-content/40 italic">
                        Source: {task.sourceConversation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task._id)}
                  className="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 rounded-lg"
                  title="Delete Task"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagerModal;
