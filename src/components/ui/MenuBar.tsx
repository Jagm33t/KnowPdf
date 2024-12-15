// MenuBar.tsx
import React, { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, ListCollapse, Heading1, Sparkles } from "lucide-react";
import { DrizzleChat } from "@/lib/db/schema";
// import { getEmbeddings } from "../../lib/embeddings";
// import { searchPinecone } from "../../lib/pinecone"; 

const MenuBar = ({ editor, chats }: { editor: any; chats: DrizzleChat[]; onAiResponse: (response: string) => void;  }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!editor) {
    return null;
  }


  const onAiClick = async () => {
    console.log("AI Clicked");
    
    try {
      // Step 1: Get selected text from the editor
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ''
      );
      console.log("Selected Text:", selectedText);
  
      // Step 2: Validate the selection
      if (!selectedText || selectedText.trim() === "") {
        console.error("No text selected!");
        return;
      }
  
      // Step 3: Ensure chats array has data
      if (!chats || chats.length === 0) {
        console.error("No chat context available!");
        return;
      }
  
      // Step 4: Extract fileKey from chats
      const fileKey = chats[0]?.fileKey; // Assuming you always take the first chat
      if (!fileKey) {
        console.error("File key is missing!");
        return;
      }
  
      // Step 5: Prepare data to send to the backend
      const payload = {
        selectedText,
        fileKey
      };
      console.log("Payload to Backend:", payload);
  
      // Step 6: Call backend API
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      // Step 7: Handle the backend response
      if (!response.ok) {
        console.error("Backend Error:", response.statusText);
        return;
      }
  
      const result = await response.json();
      console.log("Backend Result:", result);
  
      // Step 8: Append AI result to notes or UI
      if (result?.answer) {
        const aiResponse = result.answer;
        setAiResponse(aiResponse); // Store the AI response in local state
        onAiResponse(aiResponse); // Pass the response to the parent component

        editor.dispatch({
          changes: {
            from: editor.state.selection.to,
            insert: `\n\nAI Response:\n${aiResponse}`,
          },
        });
      }
    } catch (error) {
      console.error("Error during AI processing:", error);
    }
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
            <Bold  className="hover:text-[#33679c]"/>
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
    </div>
  );
};

export default MenuBar;
