"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ textValue, setTextValue }) {
  const [editorValue, setEditorValue] = useState("");

  const handleChange = (value) => {
    setEditorValue(value);
    setTextValue(value);
  };

  return (
    <div>
      <h2>Simple Quill Editor</h2>
      <ReactQuill
        value={editorValue}
        onChange={handleChange}
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
