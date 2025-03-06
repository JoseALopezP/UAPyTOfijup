'use client'
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TextEditor({ textValue, setTextValue }){
  const handleChange = (textValue) => {
    setTextValue(textValue);
  };
  return (
    <div>
      <h2>Simple Quill Editor</h2>
      <ReactQuill
        value={textValue}
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
};
