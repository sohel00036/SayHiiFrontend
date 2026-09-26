import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAgentStore = create((set, get) => ({
  tasks: [],
  isTasksLoading: false,
  isAgentRunning: false,
  draftMessage: "",
  isTaskManagerOpen: false,
  isAgentModalOpen: false,

  setDraftMessage: (text) => set({ draftMessage: text }),
  clearDraftMessage: () => set({ draftMessage: "" }),
  setIsTaskManagerOpen: (isOpen) => set({ isTaskManagerOpen: isOpen }),
  setIsAgentModalOpen: (isOpen) => set({ isAgentModalOpen: isOpen }),

  getTasks: async () => {
    set({ isTasksLoading: true });
    try {
      const res = await axiosInstance.get("/ai/tasks");
      set({ tasks: res.data });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      set({ isTasksLoading: false });
    }
  },

  toggleTask: async (taskId) => {
    try {
      const res = await axiosInstance.patch(`/ai/tasks/${taskId}/toggle`);
      set({
        tasks: get().tasks.map((t) => (t._id === taskId ? res.data : t)),
      });
      toast.success(res.data.completed ? "Task marked as completed" : "Task marked as pending");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task status");
    }
  },

  deleteTask: async (taskId) => {
    try {
      await axiosInstance.delete(`/ai/tasks/${taskId}`);
      set({
        tasks: get().tasks.filter((t) => t._id !== taskId),
      });
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  },

  runAgent: async (instruction, targetUserId = null) => {
    set({ isAgentRunning: true });
    try {
      const res = await axiosInstance.post("/ai/agent", {
        query: instruction,
        instruction,
        targetUserId,
      });

      // Refresh tasks if task extraction happened
      if (res.data?.action === "extract_tasks" && res.data?.data?.savedTasks) {
        get().getTasks();
      }

      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "AI Agent request failed";
      toast.error(msg);
      throw error;
    } finally {
      set({ isAgentRunning: false });
    }
  },
}));
