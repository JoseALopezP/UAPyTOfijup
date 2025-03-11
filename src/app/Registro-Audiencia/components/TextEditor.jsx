"use client";
import "react-quill/dist/quill.snow.css";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import './TextEditor.css'; 
import styles from '../RegistroAudiencia.module.css';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ textValue, setTextValue }) {
  const handleChange = (value) => {
    setTextValue(value);
  };

  return (
    <div className={`${styles.textEditorContainer}`}>
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
