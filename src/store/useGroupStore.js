import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  pendingInvites: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isInvitesLoading: false,
  isGroupMessagesLoading: false,
  isCreateGroupOpen: false,
  isInvitesModalOpen: false,

  setIsCreateGroupOpen: (isOpen) => set({ isCreateGroupOpen: isOpen }),
  setIsInvitesModalOpen: (isOpen) => set({ isInvitesModalOpen: isOpen }),

  setSelectedGroup: (group) => {
    // When selecting a group, clear 1-on-1 selectedUser
    useChatStore.getState().setSelectedUser(null);
    set({ selectedGroup: group, groupMessages: [] });
  },

  clearSelectedGroup: () => set({ selectedGroup: null, groupMessages: [] }),

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getPendingInvites: async () => {
    set({ isInvitesLoading: true });
    try {
      const res = await axiosInstance.get("/groups/invites");
      set({ pendingInvites: res.data });
    } catch (error) {
      console.error("Failed to fetch group invites:", error);
    } finally {
      set({ isInvitesLoading: false });
    }
  },

  createGroup: async ({ name, description, memberIds }) => {
    try {
      const res = await axiosInstance.post("/groups/create", {
        name,
        description,
        memberIds,
      });
      set({ groups: [res.data, ...get().groups] });
      toast.success(`Group "${name}" created! Invitations sent.`);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create group";
      toast.error(msg);
      throw error;
    }
  },

  acceptInvite: async (inviteId) => {
    try {
      const res = await axiosInstance.post(`/groups/invites/${inviteId}/accept`);
      set({
        pendingInvites: get().pendingInvites.filter((inv) => inv._id !== inviteId),
        groups: [res.data.group, ...get().groups],
      });
      toast.success(res.data.message || "Joined group!");
      return res.data.group;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept invite");
    }
  },

  declineInvite: async (inviteId) => {
    try {
      await axiosInstance.post(`/groups/invites/${inviteId}/decline`);
      set({
        pendingInvites: get().pendingInvites.filter((inv) => inv._id !== inviteId),
      });
      toast.success("Invitation declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline invite");
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async ({ text, image }) => {
    const { selectedGroup, groupMessages } = get();
    if (!selectedGroup) return;

    try {
      const res = await axiosInstance.post(`/groups/${selectedGroup._id}/send`, {
        text,
        image,
      });

      // Avoid duplicate if socket arrives immediately
      if (!groupMessages.some((m) => m._id === res.data._id)) {
        set({ groupMessages: [...groupMessages, res.data] });
      }

      // Update last message in group list
      set({
        groups: get().groups.map((g) =>
          g._id === selectedGroup._id
            ? { ...g, lastMessage: { text: res.data.text, createdAt: res.data.createdAt } }
            : g
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send group message");
    }
  },

  subscribeToGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("groupInvitation");
    socket.off("newGroupMessage");
    socket.off("groupMemberJoined");

    // Real-time group invite notification
    socket.on("groupInvitation", (inviteData) => {
      set({ pendingInvites: [inviteData, ...get().pendingInvites] });
      toast(
        `✉️ ${inviteData.invitedBy.fullName} invited you to join "${inviteData.group.name}"! Click the Bell icon to review.`,
        { duration: 8000 }
      );
    });

    // Real-time group message
    socket.on("newGroupMessage", ({ groupId, message }) => {
      const { selectedGroup, groupMessages, groups } = get();

      // If viewing this group, append message
      if (selectedGroup && selectedGroup._id === groupId) {
        if (!groupMessages.some((m) => m._id === message._id)) {
          set({ groupMessages: [...groupMessages, message] });
        }
      }

      // Update group order & last message
      const targetGroup = groups.find((g) => g._id === groupId);
      if (targetGroup) {
        const updated = {
          ...targetGroup,
          lastMessage: { text: message.text, createdAt: message.createdAt },
        };
        const rest = groups.filter((g) => g._id !== groupId);
        set({ groups: [updated, ...rest] });
      }
    });

    // Real-time group member joined
    socket.on("groupMemberJoined", ({ groupId, user, systemMessage }) => {
      const { selectedGroup, groupMessages } = get();
      if (selectedGroup && selectedGroup._id === groupId) {
        set({
          selectedGroup: {
            ...selectedGroup,
            members: [...selectedGroup.members, user],
          },
          groupMessages: [...groupMessages, systemMessage],
        });
      }
      get().getGroups();
    });
  },

  unsubscribeFromGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("groupInvitation");
    socket.off("newGroupMessage");
    socket.off("groupMemberJoined");
  },
}));
