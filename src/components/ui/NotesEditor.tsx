import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import axios from "axios";
import MenuBar from "./MenuBar";
import { DrizzleChat } from "@/lib/db/schema";

const NotesEditor = ({
  chatId,
  chats,
  appendedMessage,
  setLoadingState,
  isPro
}: {
  chats: DrizzleChat[];
  chatId: string;
  appendedMessage?: string[];
  setLoadingState: (isLoading: boolean) => void;
  isPro: boolean;
}) => {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editorDisabled, setEditorDisabled] = useState<boolean>(false);

  const maxContentLength = 200;  // Define the maximum content length

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
        class: "focus:outline-none h-screen p-5",
      },
    },
    content: notes,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
    },
  });

  useEffect(() => {
    setLoadingState(true); // Example usage
    setTimeout(() => setLoadingState(false), 2000); // Simulated loading
  }, [setLoadingState]);

  useEffect(() => {
    const fetchExistingNote = async () => {
      if (!chatId) {
        setNotes("Please add your first note.");
        return;
      }

      setLoading(true);
      setLoadingState(true); // Update parent loading state
      setError(null);

      try {
        const response = await axios.get(`/api/get-notes?chatId=${chatId}`);
        if (response.data) {
          const content = response.data.content;
          setNotes(content);
          editor?.commands.setContent(content);
        } else {
          setNotes("Please add your first note.");
        }
      } catch (err) {
        console.log("Error:", err);
        setError("Error fetching notes");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingNote();
  }, [chatId, editor]);

  useEffect(() => {
    if (appendedMessage && editor) {
      appendedMessage.forEach((message) => {
        appendContentInEditor(message);
      });
    }
  }, [appendedMessage, editor]);

  useEffect(() => {
    // Disable the editor if the content length exceeds the limit and user is not Pro
    if (editor && !isPro && editor.getText().length > maxContentLength) {
      setEditorDisabled(true);
    } else {
      setEditorDisabled(false);
    }
  }, [isPro, notes, editor]);

  const appendContentInEditor = (newContent: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`<p>${newContent}</p>`).run();
    }
  };

  const saveNote = async () => {
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
    <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg shadow-lg p-6 paper-style h-full overflow-hidden flex flex-col relative">
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-50">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-gray-700 font-medium">Processing...</span>
        </div>
      )}

      {/* Toolbar */}
      <MenuBar chats={chats} editor={editor} saveNote={saveNote} setLoadingState={setLoading} />

      {/* Editor Content */}
      <div className="editor-content w-full h-full rounded overflow-hidden relative">
        <div className="h-full overflow-y-auto">
          {/* Display message if the editor is disabled */}
          {editorDisabled ? (
            <div className="text-sm text-red-500">
              You need to subscribe to Pro to add more content.
            </div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;
