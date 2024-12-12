import React, { useState, useEffect } from "react";
import { EditorProvider, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style"; // For text size customization
import { BulletList } from "@tiptap/extension-bullet-list"; // For bullet points
import ListItem from "@tiptap/extension-list-item"; // Correct import for ListItem
import Underline from '@tiptap/extension-underline'; // Import the Underline extension
import { cn } from "@/lib/utils"; // Assuming cn is a utility function for conditional class names

const NotesEditor = () => {
  const [notes, setNotes] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline, // Enable Underline functionality
      TextStyle, // Adds text size style
      BulletList, // Adds bullet points functionality
      ListItem, // Corrected import for ListItem
    ],
    content: notes,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
    },
  });

  useEffect(() => {
    console.log("Tiptap Editor Initialized");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
      <div className="w-full max-w-2xl bg-white border rounded-lg shadow-lg p-4 h-full">
        {/* Toolbar */}
        <div className="flex space-x-4 mb-2">
          {/* Bold Button */}
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={cn(
              "text-xl font-bold",
              editor?.isActive("bold") ? "bg-gray-200" : "bg-transparent"
            )}
          >
            B
          </button>

          {/* Italic Button */}
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={cn(
              "text-xl font-italic",
              editor?.isActive("italic") ? "bg-gray-200" : "bg-transparent"
            )}
          >
            I
          </button>

          {/* Underline Button */}
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={cn(
              "text-xl underline",
              editor?.isActive("underline") ? "bg-gray-200" : "bg-transparent"
            )}
          >
            U
          </button>

          {/* Bullet List Button */}
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className="text-xl"
          >
            •
          </button>

          {/* Text Size Selector */}
          <select
            onChange={(e) => {
              const fontSize = e.target.value;
              editor?.chain().focus().setMark("textStyle", { fontSize }).run();
            }}
            className="p-1"
          >
            <option value="16px">Small</option>
            <option value="18px">Medium</option>
            <option value="20px">Large</option>
            <option value="24px">Extra Large</option>
          </select>
        </div>

        {/* Editor Content */}
        <div className="h-full flex-1">
          {/* Ensuring editor takes the full height of its container */}
          <EditorContent editor={editor} className="prose sm:prose lg:prose-xl w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;
