import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import axios from "axios";
import MenuBar from "./MenuBar"; // Adjust the path if placed in a different folder
import { DrizzleChat } from "@/lib/db/schema";

const NotesEditor = ({ chatId, chats, setLoadingState }: { chats: DrizzleChat[]; chatId: number; setLoadingState: (loading: boolean) => void }) => {
  const [notes, setNotes] = useState<string>("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none h-screen p-5", // Your custom class for the editor
      },
    },
    content: notes,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
      debounceAutoSave();
    },
  });

  useEffect(() => {
    const fetchExistingNote = async () => {
      setLoadingState(true); 
      setError(null);
      try {
        const response = await axios.get(`/api/get-notes?chatId=${chatId}`);
        if (response.data) {
          const content = response.data.content;
          setNotes(content);
          editor?.commands.setContent(content);
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes.");
      } finally {
        setLoadingState(false);
      }
    };

    fetchExistingNote();
  }, [chatId, editor]);

  const debounceAutoSave = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      console.log("Auto-saving...");
      autoSaveNote();
    }, 500);

    setTypingTimeout(newTimeout);
  };

  const autoSaveNote = async () => {
    if (!notes) return;
    setLoadingState(true);
    try {
      await axios.post("/api/save-notes", {
        chatId,
        content: notes,
      });
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note.");
    } finally {
      setLoadingState(false);
    }
  };

  return (
   <div
  className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-lg p-6 paper-style h-full"
>
  {error && <div className="text-red-600 mb-2">{error}</div>}
  {loading && <div className="mt-4 text-gray-500">Saving...</div>}

  {/* Toolbar */}
  <MenuBar chats={chats} editor={editor} />

  {/* Editor Content */}
  <div
    className="editor-content w-full rounded overflow-hidden "
  >
    <EditorContent editor={editor} />
  </div>
</div>

  );
};

export default NotesEditor;
