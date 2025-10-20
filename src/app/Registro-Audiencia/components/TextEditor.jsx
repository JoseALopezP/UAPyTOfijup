import React, { useRef, useState, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from './TextEditor.module.css'

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
  ],
};
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "align",
  "color",
  "background",
  "blockquote",
  "code-block",
];


export default function TextEditor({ textValue, setTextValue }) {
  const quillRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && quillRef.current) {
      const instance = quillRef.current.getEditor();
      setEditor(instance);
    }
  }, [mounted]);
  useEffect(() => {
    if (editor && textValue !== undefined) {
      const current = editor.root.innerHTML;
      if (current !== textValue) editor.root.innerHTML = textValue;
    }
  }, [textValue, editor]);
  const handleChange = (value) => {
    if (setTextValue) setTextValue(value);
  };
  const transformSelection = (transformer) => {
    if (!editor) return;
    const range = editor.getSelection();
    if (!range || range.length === 0) return;
    const text = editor.getText(range.index, range.length);
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, transformer(text));
  };
  const toUpper = () => transformSelection((t) => t.toUpperCase());
  const toLower = () => transformSelection((t) => t.toLowerCase());
  if (!mounted) return null;
  return (
    <div className={styles.textEditorWrapper}>
      <div className={styles.conversionButtonBlock}>
        <button type="button" onClick={toUpper}>A↑</button>
        <button type="button" onClick={toLower}>a↓</button>
      </div>
      <ReactQuill
        ref={quillRef}
        value={textValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>
  );
}
