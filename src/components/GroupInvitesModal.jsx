import { useEffect, useState } from "react";
import { Users, Check, X, Bell, Loader2, Calendar } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { formatMessageTime } from "../lib/utils";

const GroupInvitesModal = ({ isOpen, onClose }) => {
  const {
    pendingInvites,
    isInvitesLoading,
    getPendingInvites,
    acceptInvite,
    declineInvite,
    setSelectedGroup,
  } = useGroupStore();

  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getPendingInvites();
    }
  }, [isOpen, getPendingInvites]);

  if (!isOpen) return null;

  const handleAccept = async (invite) => {
    setProcessingId(invite._id);
    try {
      const group = await acceptInvite(invite._id);
      if (group) {
        setSelectedGroup(group);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invite) => {
    setProcessingId(invite._id);
    try {
      await declineInvite(invite._id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-base-100 border border-base-300 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Bell className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                Group Invitations
                {pendingInvites.length > 0 && (
                  <span className="badge badge-sm badge-primary">{pendingInvites.length}</span>
                )}
              </h2>
              <p className="text-xs text-base-content/60">
                You decide whether to join groups you are invited to
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isInvitesLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-base-content/60 gap-2">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm font-medium">Checking invitations...</p>
            </div>
          ) : pendingInvites.length === 0 ? (
            <div className="text-center py-12 text-base-content/60 space-y-2">
              <Users className="size-12 mx-auto text-base-content/30" />
              <p className="text-sm font-semibold">No pending invitations</p>
              <p className="text-xs text-base-content/50">
                When someone invites you to a group, it will appear here for your approval.
              </p>
            </div>
          ) : (
            pendingInvites.map((invite) => {
              const group = invite.group;
              const inviter = invite.invitedBy;
              const isProcessing = processingId === invite._id;

              return (
                <div
                  key={invite._id}
                  className="p-4 rounded-xl border border-base-300 bg-base-100 shadow-sm space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="avatar placeholder mt-0.5">
                      <div className="bg-primary/10 text-primary rounded-xl size-10 flex items-center justify-center font-bold">
                        <Users className="size-5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-base-content truncate">
                        {group?.name || "Unnamed Group"}
                      </h3>
                      {group?.description && (
                        <p className="text-xs text-base-content/70 mt-0.5 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-base-content/60">
                        <span>
                          Invited by <strong className="text-base-content">{inviter?.fullName}</strong>
                        </span>
                        <span>•</span>
                        <span>{invite.createdAt ? formatMessageTime(invite.createdAt) : "Recently"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Accept / Decline actions */}
                  <div className="pt-2 border-t border-base-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDecline(invite)}
                      disabled={isProcessing}
                      className="btn btn-xs btn-ghost text-error hover:bg-error/10 gap-1"
                    >
                      <X className="size-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleAccept(invite)}
                      disabled={isProcessing}
                      className="btn btn-xs btn-primary gap-1 px-3 shadow"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      <span>Accept & Join</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInvitesModal;
