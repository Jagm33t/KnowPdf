'use client';

import React, { useState, useEffect } from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check the window size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 899);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (isMobile) {
    return null; // Return nothing if the screen size is mobile
  }

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
