import { X, Bot, Sparkles, ListTodo, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAgentStore } from "../store/useAgentStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, clearSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();
  const { setIsAgentModalOpen, setIsTaskManagerOpen } = useAgentStore();

  if (!selectedUser && !selectedGroup) return null;

  // RENDER GROUP HEADER
  if (selectedGroup) {
    const memberNames = selectedGroup.members?.map((m) => m.fullName).join(", ") || "";

    return (
      <div className="p-2.5 border-b border-base-300 bg-base-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/40 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
              <Users className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <span>{selectedGroup.name}</span>
                <span className="badge badge-primary badge-xs text-[10px]">
                  {selectedGroup.members?.length || 1} members
                </span>
              </h3>
              <p className="text-xs text-base-content/60 truncate max-w-xs sm:max-w-md">
                {memberNames || selectedGroup.description || "Group Chat"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="btn btn-xs btn-ghost gap-1 text-primary hover:bg-primary/10"
              title="AI Assistant for this group conversation"
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

            <button onClick={clearSelectedGroup} className="btn btn-ghost btn-xs btn-circle">
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 1-ON-1 CHAT HEADER
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
