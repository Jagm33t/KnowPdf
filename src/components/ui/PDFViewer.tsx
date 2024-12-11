import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <div className="w-full h-full bg-white">
      <iframe
        src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
        className="w-full h-full border-none"
        style={{ backgroundColor: "white" }}
      ></iframe>
    </div>
  );
};

export default PDFViewer;
