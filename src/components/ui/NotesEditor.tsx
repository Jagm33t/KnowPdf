import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import axios from "axios";
import MenuBar from "./MenuBar"; // Adjust the path if placed in a different folder

const NotesEditor = ({ chatId }: { chatId: number }) => {
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
    content: notes,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
      debounceAutoSave();
    },
  });

  useEffect(() => {
    const fetchExistingNote = async () => {
      setLoading(true);
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
        setLoading(false);
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
    setLoading(true);
    try {
      await axios.post("/api/save-notes", {
        chatId,
        content: notes,
      });
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
      <div className="w-full max-w-2xl bg-white border rounded-lg shadow-lg p-4 h-full">
        {error && <div className="text-red-600 mb-2">{error}</div>}
      
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default NotesEditor;
