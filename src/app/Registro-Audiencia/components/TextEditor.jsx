"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import './TextEditor.css'; 

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ textValue, setTextValue }) {
  const handleChange = (value) => {
    setTextValue(value);
  };

  return (
    <div>
      <ReactQuill
        value={textValue}
        onChange={handleChange}
        className="quillEditor"
        modules={{
          toolbar: [
            [{ header: "1" }, { header: "2" }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["bold", "italic", "underline"],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            ["blockquote", "code-block"],
          ],
        }}
      />
    </div>
  );
}
