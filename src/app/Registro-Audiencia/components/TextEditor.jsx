import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from './TextEditor.module.css'

export default function TextEditor({ textValue, setTextValue }) {
  const quillRef = useRef(null);
  const [editor, setEditor] = useState(null);
  useEffect(() => {
    if (quillRef.current) {
      const instance = quillRef.current.getEditor();
      console.log("✅ Instancia Quill detectada:", instance);
      setEditor(instance);
    }
  }, []);
  useEffect(() => {
    if (editor && textValue !== undefined) {
      const current = editor.root.innerHTML;
      if (current !== textValue) {
        editor.root.innerHTML = textValue;
      }
    }
  }, [textValue, editor]);
  const handleChange = (value) => {
    if (setTextValue) setTextValue(value);
  };
  const transformSelection = (transformer) => {
    if (!editor) {
      console.warn("⚠️ El editor aún no está listo.");
      return;
    }

    const range = editor.getSelection();
    if (!range || range.length === 0) {
      console.warn("⚠️ No hay selección activa.");
      return;
    }

    const text = editor.getText(range.index, range.length);
    const transformed = transformer(text);
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, transformed);
  };

  const toUpper = () => transformSelection((t) => t.toUpperCase());
  const toLower = () => transformSelection((t) => t.toLowerCase());

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
