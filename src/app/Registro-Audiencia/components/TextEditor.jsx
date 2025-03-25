"use client";
import "react-quill/dist/quill.snow.css";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import './TextEditor.css'; 
import styles from '../RegistroAudiencia.module.css';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ textValue, setTextValue }) {
  const [editorValue, setEditorValue] = useState(textValue); 

  useEffect(() => {
    setEditorValue(textValue);
  }, [textValue]);

  const handleChange = (value) => {
    setEditorValue(value); 
    setTextValue(value);
  };

  return (
    <div className={`${styles.textEditorContainer}`}>
      <ReactQuill
        value={editorValue}
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
