import { X, Bot, Sparkles, ListTodo } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useAgentStore } from "../store/useAgentStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setIsAgentModalOpen, setIsTaskManagerOpen } = useAgentStore();

  if (!selectedUser) return null;

  const isOnline = selectedUser.isBot || onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium flex items-center gap-1.5">
              <span>{selectedUser.fullName}</span>
              {selectedUser.isBot && (
                <span className="badge badge-primary badge-xs text-[10px] font-bold py-0.5 px-1 flex items-center gap-0.5">
                  <Bot className="size-3" />
                  AI
                </span>
              )}
            </h3>
            <p className="text-sm text-base-content/70">
              {selectedUser.isBot ? "Always Available" : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!selectedUser.isBot && (
            <>
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="btn btn-xs btn-ghost gap-1 text-primary hover:bg-primary/10"
                title="AI Assistant for this conversation"
              >
                <Sparkles className="size-3.5" />
                <span className="hidden md:inline font-medium">AI Agent</span>
              </button>

              <button
                onClick={() => setIsTaskManagerOpen(true)}
                className="btn btn-xs btn-ghost gap-1 text-emerald-500 hover:bg-emerald-500/10"
                title="View Action Items & Tasks"
              >
                <ListTodo className="size-3.5" />
                <span className="hidden md:inline font-medium">Tasks</span>
              </button>
            </>
          )}

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-xs btn-circle">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
