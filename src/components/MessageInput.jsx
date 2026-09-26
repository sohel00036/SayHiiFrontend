import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAgentStore } from "../store/useAgentStore";
import { Image, Send, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore();
  const { selectedGroup, sendGroupMessage } = useGroupStore();
  const { draftMessage, clearDraftMessage, setIsAgentModalOpen } = useAgentStore();

  useEffect(() => {
    if (draftMessage) {
      setText(draftMessage);
      clearDraftMessage();
    }
  }, [draftMessage, clearDraftMessage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      if (selectedGroup) {
        await sendGroupMessage({
          text: text.trim(),
          image: imagePreview,
        });
      } else {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={
              selectedGroup
                ? `Message #${selectedGroup.name}...`
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm sm:btn-md text-primary hover:bg-primary/10"
            onClick={() => setIsAgentModalOpen(true)}
            title="Open AI Assistant (Summarize, Action Items, Smart Reply)"
          >
            <Sparkles size={20} />
          </button>

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle btn-sm sm:btn-md ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm sm:btn-md btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
