// MenuBar.tsx
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

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

      <button
  onClick={() => editor.chain().focus().toggleBold().run()}
  className={`btn ${editor.isActive("bold") ? "bg-gray-200" : "bg-white"}`}
>
  <Bold />
</button>
<button
  onClick={() => editor.chain().focus().toggleItalic().run()}
  className={`btn ${editor.isActive("italic") ? "bg-gray-200" : "bg-white"}`}
>
  <Italic />
</button>


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
    </div>
  );
};

export default MenuBar;
