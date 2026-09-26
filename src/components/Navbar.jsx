import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useAgentStore } from "../store/useAgentStore";
import { LogOut, MessageSquare, Settings, Sparkles, ListTodo } from "lucide-react";
import AiAgentModal from "./AiAgentModal";
import TaskManagerModal from "./TaskManagerModal";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const {
    isAgentModalOpen,
    setIsAgentModalOpen,
    isTaskManagerOpen,
    setIsTaskManagerOpen,
  } = useAgentStore();

  return (
    <>
      <header
        className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
      >
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">SayHii</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {authUser && (
                <>
                  <button
                    onClick={() => setIsAgentModalOpen(true)}
                    className="btn btn-sm btn-primary gap-1.5 shadow-sm hover:shadow transition-all"
                    title="Open AI Assistant (Summaries, Tasks, Smart Replies)"
                  >
                    <Sparkles className="size-4" />
                    <span className="hidden sm:inline font-medium">AI Assistant</span>
                  </button>

                  <button
                    onClick={() => setIsTaskManagerOpen(true)}
                    className="btn btn-sm btn-ghost border border-base-300 gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                    title="View Action Items & Tasks"
                  >
                    <ListTodo className="size-4 text-emerald-500" />
                    <span className="hidden md:inline font-medium">Tasks</span>
                  </button>
                </>
              )}

              <Link to={"/settings"} className="btn btn-sm gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link to={"/profile"} className="btn btn-sm gap-2 items-center">
                    <div className="size-6 rounded-full overflow-hidden border border-base-content/20 flex items-center justify-center">
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                        alt={authUser.fullName || "Profile"}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="hidden sm:inline font-medium">Profile</span>
                  </Link>

                  <button className="flex gap-2 items-center btn btn-sm btn-ghost" onClick={logout}>
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* AI Agent Modal (RAG search, Summarization, Action Items, Smart Reply) */}
      <AiAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />

      {/* Task Manager Modal */}
      <TaskManagerModal
        isOpen={isTaskManagerOpen}
        onClose={() => setIsTaskManagerOpen(false)}
      />
    </>
  );
};

export default Navbar;
