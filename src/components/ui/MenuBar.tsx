import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, ListCollapse, Heading1, Sparkles, Download } from "lucide-react";
import { DrizzleChat } from "@/lib/db/schema";

const MenuBar = ({ editor, chats }: { editor: any; chats: DrizzleChat[]; }) => {

  if (!editor) {
    return null;
  }

  const cleanResponse = (response: string): string => {
    return response.replace(/```.*?\n/g, '').replace(/```/g, '').trim();
  };

  const onAiClick = async () => {
    console.log("AI Clicked");
    
    try {
      // Get selected text from the editor
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ''
      );
      console.log("Selected Text:", selectedText);
  
      // Validate the selection
      if (!selectedText || selectedText.trim() === "") {
        console.error("No text selected!");
        return;
      }
  
      // Ensure chats array has data
      if (!chats || chats.length === 0) {
        console.error("No chat context available!");
        return;
      }
  
      // Extract fileKey from chats
      const fileKey = chats[0]?.fileKey;
      if (!fileKey) {
        console.error("File key is missing!");
        return;
      }
  
      // Prepare data to send to the backend
      const payload = {
        selectedText,
        fileKey
      };
      console.log("Payload to Backend:", payload);
  
      // Call backend API
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      // Handle backend response
      if (!response.ok) {
        console.error("Backend Error:", response.statusText);
        return;
      }
  
      const result = await response.json();
      console.log("Backend Result:", result);
  
      // Append AI result to notes or UI
      if (result?.answer) {
        editor.commands.setTextSelection(editor.state.doc.content.size);
        editor.commands.insertContent("\n");
        editor.commands.insertContent([
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Answer: ",
          },
          {
            type: "text",
            text: cleanResponse(result.answer),
          },
        ]);

        const cleanedAnswer = cleanResponse(result.answer);
        editor.commands.insertContent(cleanedAnswer);

        const lastNode = editor.view.dom.lastChild;
        if (lastNode) {
          lastNode.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    } catch (error) {
      console.error("Error during AI processing:", error);
    }
  };

  // Function to download the content as a .txt file
  const downloadNote = () => {
    const noteContent = editor.getHTML();  // Get the content in HTML format
    const contentToDownload = editor.getText();  // Get the content in plain text

    const blob = new Blob([contentToDownload], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "note.txt"; // The file name for the download
    link.click(); // Trigger the download
  };

  return (
    <div className="control-group flex flex-wrap gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="btn"><Heading1 className="hover:text-[#33679c]"/></DropdownMenuTrigger>
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

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`btn ${editor.isActive("bold") ? "bg-gray-200" : "bg-white"}`}
      >
        <Bold className="hover:text-[#33679c]"/>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`btn ${editor.isActive("italic") ? "bg-gray-200" : "bg-white"}`}
      >
        <Italic className="hover:text-[#33679c]"/>
      </button>

      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'is-active' : ''}>
        <Highlighter className="hover:text-[#33679c]"/>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <ListCollapse className="hover:text-[#33679c]"/>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="btn"><AlignLeft/></DropdownMenuTrigger>
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

      <button
        onClick={() => onAiClick()}
        className={'hover:text-[#33679c]'}
      >
        <Sparkles/>
      </button>

      {/* Download Button */}
      <button
        onClick={downloadNote}
        className={'hover:text-[#33679c]'}
      >
        <Download className="hover:text-[#33679c]"/>
      </button>
    </div>
  );
};

export default MenuBar;
