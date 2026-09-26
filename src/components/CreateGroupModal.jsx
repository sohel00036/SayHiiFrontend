import { useState } from "react";
import { Users, X, Loader2, Search, Check, Shield } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const { createGroup } = useGroupStore();
  const { users } = useChatStore();
  const { authUser } = useAuthStore();

  if (!isOpen) return null;

  // Filter out bots and current user
  const selectableUsers = users.filter((u) => {
    if (u.isBot) return false;
    if (u._id === authUser?._id) return false;
    if (searchQuery.trim()) {
      return u.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  const toggleSelectUser = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a group name");
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one contact to invite");
      return;
    }

    setLoading(true);
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      });

      // Reset form
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-base-100 border border-base-300 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Create a New Group</h2>
              <p className="text-xs text-base-content/60">Invite members to collaborate in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3.5 border-b border-base-300">
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">
                Group Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Project Apollo, Family & Friends"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                className="input input-bordered input-sm sm:input-md w-full focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief purpose of this group..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
                className="input input-bordered input-sm w-full focus:outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Note on invitation workflow */}
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl p-2.5 text-xs text-base-content/75">
              <Shield className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Member Consent Policy:</strong> Selected users receive a notification to join. They will only appear in the group once they click <em>Accept</em>.
              </span>
            </div>
          </div>

          {/* Member Selection Section */}
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-base-content/70">
                Select Members ({selectedMemberIds.length} selected)
              </label>
              {selectedMemberIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="relative mb-2.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-xs sm:input-sm w-full pl-9 pr-3 text-xs focus:outline-none"
              />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {selectableUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-base-content/50">
                  No contacts found to invite
                </div>
              ) : (
                selectableUsers.map((user) => {
                  const isSelected = selectedMemberIds.includes(user._id);

                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleSelectUser(user._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 shadow-sm"
                          : "bg-base-100 border-base-300 hover:bg-base-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="size-9 rounded-full object-cover border"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-base-content">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-base-content/60 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`size-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-base-content/30"
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 border-t border-base-300 flex items-center justify-end gap-2 bg-base-200/40">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || selectedMemberIds.length === 0}
              className="btn btn-sm btn-primary gap-1.5 px-4"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span>Create Group & Send Invites</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
