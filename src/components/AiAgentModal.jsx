import { useState } from "react";
import {
  Sparkles,
  Search,
  X,
  Loader2,
  FileText,
  ListTodo,
  Send,
  Copy,
  Check,
  ArrowRight,
  Bot,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useAgentStore } from "../store/useAgentStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import { formatMessageTime } from "../lib/utils";

const AiAgentModal = ({ isOpen, onClose, initialTab = "agent" }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'agent' | 'rag' | 'tasks'
  
  // Agent state
  const [instruction, setInstruction] = useState("");
  const { runAgent, isAgentRunning, setDraftMessage, setIsTaskManagerOpen } = useAgentStore();
  const { selectedUser, users } = useChatStore();
  const [agentResult, setAgentResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // RAG Search state
  const [ragQuery, setRagQuery] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [ragError, setRagError] = useState(null);

  if (!isOpen) return null;

  const handleRunAgent = async (customInstruction = null) => {
    const textToRun = customInstruction || instruction;
    if (!textToRun.trim() || isAgentRunning) return;

    setAgentResult(null);
    setCopied(false);
    try {
      const result = await runAgent(
        textToRun.trim(),
        selectedUser ? selectedUser._id : null
      );
      setAgentResult(result);
    } catch (err) {
      console.error("Agent error:", err);
    }
  };

  const handleRAGSearch = async (e) => {
    e?.preventDefault();
    if (!ragQuery.trim() || ragLoading) return;

    setRagLoading(true);
    setRagError(null);
    try {
      const res = await axiosInstance.post("/ai/ask", { query: ragQuery.trim() });
      setRagResult(res.data);
    } catch (err) {
      console.error("Error searching chats:", err);
      setRagError(err.response?.data?.message || "Failed to search chat history.");
    } finally {
      setRagLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseDraftInChat = (draftText) => {
    setDraftMessage(draftText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-base-100 border border-base-300 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                SayHii AI Assistant
                <span className="badge badge-sm badge-primary font-mono text-[10px]">LangChain Agent</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Autonomous agent for summarization, action items extraction, smart replies & search
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-base-300 bg-base-100 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("agent")}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "agent"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Zap className="size-4" />
            AI Agent Tools
          </button>

          <button
            onClick={() => setActiveTab("rag")}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "rag"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Search className="size-4" />
            RAG Chat Search
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: AI AGENT */}
          {activeTab === "agent" && (
            <div className="space-y-4">
              {/* Quick Action Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() =>
                    handleRunAgent(
                      selectedUser
                        ? `Summarize my chat history with ${selectedUser.fullName}`
                        : "Summarize my active conversation and recent messages"
                    )
                  }
                  disabled={isAgentRunning}
                  className="p-3 bg-base-200/60 hover:bg-primary/10 border border-base-300 hover:border-primary/40 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-primary font-semibold text-xs">
                    <FileText className="size-4 group-hover:scale-110 transition-transform" />
                    <span>Summarize Chat</span>
                  </div>
                  <p className="text-[11px] text-base-content/60 leading-snug">
                    Get key takeaways & main topics {selectedUser ? `with ${selectedUser.fullName}` : ""}
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleRunAgent(
                      selectedUser
                        ? `Extract action items and assigned tasks from my conversation with ${selectedUser.fullName}`
                        : "Extract all action items, promises, and tasks from my recent chats"
                    )
                  }
                  disabled={isAgentRunning}
                  className="p-3 bg-base-200/60 hover:bg-emerald-500/10 border border-base-300 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-emerald-500 font-semibold text-xs">
                    <ListTodo className="size-4 group-hover:scale-110 transition-transform" />
                    <span>Extract Tasks</span>
                  </div>
                  <p className="text-[11px] text-base-content/60 leading-snug">
                    Parse action items & auto-save to Task List
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleRunAgent(
                      selectedUser
                        ? `Draft a helpful, professional reply to ${selectedUser.fullName}'s latest messages`
                        : "Draft a suitable response for my ongoing conversation"
                    )
                  }
                  disabled={isAgentRunning}
                  className="p-3 bg-base-200/60 hover:bg-amber-500/10 border border-base-300 hover:border-amber-500/40 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1 text-amber-500 font-semibold text-xs">
                    <Bot className="size-4 group-hover:scale-110 transition-transform" />
                    <span>Smart Reply Draft</span>
                  </div>
                  <p className="text-[11px] text-base-content/60 leading-snug">
                    Generate contextual reply & insert into input
                  </p>
                </button>
              </div>

              {/* Natural Language Prompt Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-base-content/70 flex items-center justify-between">
                  <span>Custom Instruction for AI Agent:</span>
                  {selectedUser && (
                    <span className="text-[11px] text-primary font-normal">
                      Target: {selectedUser.fullName}
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRunAgent()}
                    placeholder="e.g. 'Draft a polite decline to Mark's invite' or 'What tasks did Sarah assign me?'"
                    className="input input-bordered w-full text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleRunAgent()}
                    disabled={isAgentRunning || !instruction.trim()}
                    className="btn btn-primary px-5 gap-2"
                  >
                    {isAgentRunning ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isAgentRunning && (
                <div className="flex flex-col items-center justify-center py-10 text-base-content/60 gap-3 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Agent thinking & executing tools...</p>
                  <p className="text-xs text-base-content/40">Searching embeddings, retrieving history & formatting results</p>
                </div>
              )}

              {/* Agent Output Result */}
              {agentResult && !isAgentRunning && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Tool execution badge */}
                  <div className="flex items-center justify-between text-xs text-base-content/60 px-1">
                    <span className="badge badge-outline badge-sm gap-1 font-mono">
                      Tool Used: {agentResult.toolUsed || agentResult.action}
                    </span>
                    <button
                      onClick={() => copyToClipboard(agentResult.response)}
                      className="btn btn-ghost btn-xs gap-1 text-base-content/70 hover:text-base-content"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  {/* Main Result Content Card */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-base-content">
                      {agentResult.response}
                    </p>

                    {/* Action buttons based on tool outcome */}
                    {agentResult.action === "draft_reply" && (
                      <div className="pt-2 border-t border-primary/10 flex justify-end">
                        <button
                          onClick={() => handleUseDraftInChat(agentResult.response)}
                          className="btn btn-sm btn-primary gap-1.5 shadow"
                        >
                          <Send className="size-3.5" />
                          <span>Insert into Chat Input</span>
                        </button>
                      </div>
                    )}

                    {agentResult.action === "extract_tasks" && (
                      <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                        <span className="text-xs text-emerald-600 font-medium">
                          ✓ Action items extracted & saved to Task Manager!
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            setIsTaskManagerOpen(true);
                          }}
                          className="btn btn-xs btn-outline btn-emerald gap-1"
                        >
                          <ListTodo className="size-3.5" />
                          <span>View Task List</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAG SEARCH */}
          {activeTab === "rag" && (
            <div className="space-y-4">
              <form onSubmit={handleRAGSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="e.g. What did Rahul say about the project deadline?"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    className="input input-bordered w-full pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={ragLoading || !ragQuery.trim()}
                  className="btn btn-primary px-4 gap-2 flex items-center"
                >
                  {ragLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  <span>Search</span>
                </button>
              </form>

              {ragLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-base-content/60 gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Searching embeddings and analyzing chat history...</p>
                </div>
              )}

              {ragError && (
                <div className="alert alert-error text-sm">
                  <span>{ragError}</span>
                </div>
              )}

              {ragResult && !ragLoading && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                      <Sparkles className="size-4" />
                      <span>RAG Answer</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{ragResult.answer}</p>
                  </div>

                  {ragResult.sources && ragResult.sources.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-2 flex items-center gap-1.5">
                        <MessageSquare className="size-3.5" />
                        <span>Cited Source Messages ({ragResult.sources.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {ragResult.sources.map((src) => (
                          <div
                            key={src._id}
                            className="p-3 bg-base-200/60 border border-base-300 rounded-lg text-xs flex items-start gap-3"
                          >
                            <img
                              src={src.senderPic || "/avatar.png"}
                              alt={src.senderName}
                              className="size-7 rounded-full object-cover mt-0.5 border"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-semibold text-base-content truncate">
                                  {src.senderName} → {src.receiverName}
                                </span>
                                <span className="text-[10px] text-base-content/50 shrink-0">
                                  {src.createdAt ? formatMessageTime(src.createdAt) : ""}
                                </span>
                              </div>
                              <p className="text-base-content/80 text-xs italic bg-base-100/50 p-2 rounded border border-base-300/50">
                                "{src.text}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAgentModal;
