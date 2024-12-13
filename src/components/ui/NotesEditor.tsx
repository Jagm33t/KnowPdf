import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"; 

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="control-group flex flex-wrap gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="btn">Heading</DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "is-active" : ""}
          >
            Paragraph
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
          >
            H1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
          >
            H2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
          >
            H3
          </DropdownMenuItem>
        
        
        </DropdownMenuContent>
      </DropdownMenu>


      {/* Individual Buttons for Bold, Italic, Underline with Icons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`btn ${editor.isActive("bold") ? "is-active" : ""}`}
      >
        <Bold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`btn ${editor.isActive("italic") ? "is-active" : ""}`}
      >
        <Italic />
      </button>

      {/* Dropdown for Alignment Options */}
      <DropdownMenu>
        <DropdownMenuTrigger className="btn">Align</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="mr-2" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="mr-2" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="mr-2" /> Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify className="mr-2" /> Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown for Heading and Paragraph Options */}
      
    </div>
  );
};
const NotesEditor = ({ chatId }: { chatId: number }) => {
  const [notes, setNotes] = useState<string>("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the editor
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

  // Fetch notes
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

  // Auto-save
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
        {loading && <div className="mt-4 text-gray-500">Saving...</div>}

        {/* Toolbar */}
        <MenuBar editor={editor} />

        {/* Editor Content */}
        <div
  className="w-full h-full rounded overflow-hidden" // This ensures it can scroll when content overflows
  style={{
    resize: "none",
    padding: "5px",
    overflowX: "hidden", 
    overflowY: "hidden",  
  }}
>

<EditorContent
  editor={editor}
  className="w-full"
  style={{
    maxHeight: "90%",  // Set the max height as per your requirement
    overflowY: "auto",   // Enable vertical scrolling when the content exceeds maxHeight
  }}
/>
</div>

     
      </div>
    </div>
  );
};

export default NotesEditor;
