import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Bot, Search, X, Plus, MessageSquare, Bell } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const {
    groups,
    getGroups,
    selectedGroup,
    setSelectedGroup,
    pendingInvites,
    getPendingInvites,
    setIsCreateGroupOpen,
    setIsInvitesModalOpen,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
  } = useGroupStore();

  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("direct"); // 'direct' | 'groups'
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();
    getPendingInvites();
    subscribeToGroupEvents();

    return () => unsubscribeFromGroupEvents();
  }, [getUsers, getGroups, getPendingInvites, subscribeToGroupEvents, unsubscribeFromGroupEvents]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = showOnlineOnly ? (user.isBot || onlineUsers.includes(user._id)) : true;
    const matchesName = user.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesOnline && matchesName;
  });

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (isUsersLoading && users.length === 0) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
      {/* Top Header & Tab Navigation */}
      <div className="border-b border-base-300 w-full p-4 space-y-3">
        {/* Tab switchers */}
        <div className="flex items-center justify-between">
          <div className="join w-full grid grid-cols-2 p-0.5 bg-base-200 rounded-xl">
            <button
              onClick={() => setActiveTab("direct")}
              className={`join-item btn btn-xs py-1 h-auto font-medium rounded-lg transition-all ${
                activeTab === "direct"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/70 hover:text-base-content"
              }`}
            >
              <MessageSquare className="size-3.5 inline mr-1" />
              <span className="hidden lg:inline">Direct</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`join-item btn btn-xs py-1 h-auto font-medium rounded-lg transition-all relative ${
                activeTab === "groups"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/70 hover:text-base-content"
              }`}
            >
              <Users className="size-3.5 inline mr-1" />
              <span className="hidden lg:inline">Groups</span>
              {groups.length > 0 && (
                <span className="hidden lg:inline text-[10px] ml-1 opacity-75">
                  ({groups.length})
                </span>
              )}
              {pendingInvites.length > 0 && (
                <span className="size-2 rounded-full bg-amber-400 absolute top-1 right-1.5 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Pending Invites Alert Badge if any */}
        {pendingInvites.length > 0 && (
          <button
            onClick={() => setIsInvitesModalOpen(true)}
            className="w-full hidden lg:flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs hover:bg-amber-500/15 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-medium truncate">
              <Bell className="size-3.5 shrink-0" />
              <span className="truncate">{pendingInvites.length} Group Invitation(s)</span>
            </div>
            <span className="badge badge-xs badge-warning">Review</span>
          </button>
        )}

        {/* Search input */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder={activeTab === "direct" ? "Search contacts..." : "Search groups..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 pr-8 text-xs focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Direct Tab Filters / Groups Tab Action */}
        {activeTab === "direct" ? (
          <div className="hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-xs"
              />
              <span className="text-xs text-base-content/75">Show online only</span>
            </label>
            <span className="text-[11px] text-zinc-500">
              ({onlineUsers.length > 0 ? onlineUsers.length - 1 : 0} online)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/70 hidden lg:block">
              Your Groups
            </span>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="btn btn-xs btn-primary gap-1 w-full lg:w-auto shadow-sm"
              title="Create a New Group"
            >
              <Plus className="size-3.5" />
              <span className="hidden lg:inline">Create Group</span>
            </button>
          </div>
        )}
      </div>

      {/* Main List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {/* DIRECT MESSAGES LIST */}
        {activeTab === "direct" && (
          <>
            {filteredUsers.map((user) => {
              const isOnline = user.isBot || onlineUsers.includes(user._id);
              const isSelected = selectedUser?._id === user._id && !selectedGroup;

              return (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    useGroupStore.getState().clearSelectedGroup();
                  }}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300/50 transition-colors
                    ${isSelected ? "bg-base-300 ring-1 ring-base-300" : ""}
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-11 object-cover rounded-full"
                    />
                    {isOnline && (
                      <span
                        className={`absolute bottom-0 right-0 size-3 ${
                          user.isBot ? "bg-purple-500" : "bg-emerald-500"
                        } rounded-full ring-2 ring-base-100`}
                      />
                    )}
                  </div>

                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                      <span className="truncate">{user.fullName}</span>
                      {user.isBot && (
                        <span className="badge badge-primary badge-xs text-[10px] font-bold py-0.5 px-1 flex items-center gap-0.5">
                          <Bot className="size-2.5" />
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-base-content/60 truncate mt-0.5">
                      {user.isBot ? "Always Available" : isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-6 text-xs">No contacts found</div>
            )}
          </>
        )}

        {/* GROUPS LIST */}
        {activeTab === "groups" && (
          <>
            {filteredGroups.map((group) => {
              const isSelected = selectedGroup?._id === group._id;
              const memberCount = group.members?.length || 1;

              return (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300/50 transition-colors
                    ${isSelected ? "bg-base-300 ring-1 ring-base-300" : ""}
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/40 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                      <Users className="size-5" />
                    </div>
                  </div>

                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs truncate text-base-content">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-base-content/50 shrink-0">
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                      {group.lastMessage?.text || group.description || "Active Group"}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center text-zinc-500 py-8 px-4 text-xs space-y-2">
                <Users className="size-8 mx-auto opacity-30" />
                <p className="font-medium">No groups yet</p>
                <p className="text-[11px] opacity-60">
                  Click "+ Create Group" to start a new group and invite members!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
