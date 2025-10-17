"use client";
import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";

// ✅ Import dinámico que evita SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ initialValue = "Texto inicial aquí" }) {
  const quillRef = useRef(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (quillRef.current) {
      const instance = quillRef.current.getEditor();
      setEditor(instance);
    }
  }, []);

  const transformSelection = (transformer) => {
    if (!editor) return;
    const range = editor.getSelection();
    if (!range || range.length === 0) return;
    const text = editor.getText(range.index, range.length);
    const transformed = transformer(text);
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, transformed);
  };

  return (
    <div>
      <div className={`${styles.conversionButtonBlock}`}>
        <button type='button' onClick={toUpper}>A↑</button>
        <button type='button' onClick={toLower}>a↓</button>
      </div>
      <ReactQuill
        ref={quillRef}
        value={textValue}
        onChange={handleChange}
      />
    </div>
  );
}