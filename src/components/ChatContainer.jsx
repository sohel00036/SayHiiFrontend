import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const {
    selectedGroup,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const isGroupActive = Boolean(selectedGroup);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    } else if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

  const activeMessages = isGroupActive ? groupMessages : messages;
  const isLoading = isGroupActive ? isGroupMessagesLoading : isMessagesLoading;

  useEffect(() => {
    if (messageEndRef.current && activeMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeMessages.map((message) => {
          const senderIdStr = (message.senderId?._id || message.senderId || "").toString();
          const authUserIdStr = (authUser?._id || "").toString();
          const isMyMessage = senderIdStr === authUserIdStr;

          // For group chat, get sender details
          const senderName = message.senderId?.fullName || "Member";
          const senderPic = message.senderId?.profilePic || "/avatar.png";

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profilePic || "/avatar.png"
                        : isGroupActive
                        ? senderPic
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="avatar"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 text-xs">
                {isGroupActive && !isMyMessage && (
                  <span className="font-semibold text-primary mr-1.5">{senderName}</span>
                )}
                <time className="text-[10px] opacity-50">
                  {message.createdAt ? formatMessageTime(message.createdAt) : "Just now"}
                </time>
              </div>

              <div
                className={`chat-bubble flex flex-col text-sm ${
                  isMyMessage ? "chat-bubble-primary" : "bg-base-200 text-base-content"
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 object-cover"
                  />
                )}
                {message.text && (
                  <p className="whitespace-pre-wrap">
                    {message.text}
                    {message.isStreaming && (
                      <span className="inline-block animate-pulse ml-1 text-primary font-bold">▍</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
