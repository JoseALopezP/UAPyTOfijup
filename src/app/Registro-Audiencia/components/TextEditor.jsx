"use client";

import 'react-quill/dist/quill.snow.css';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import './TextEditor.css';
import styles from '../RegistroAudiencia.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function TextEditor({ textValue, setTextValue }) {
  const initialValue = textValue ?? "";
  const [editorValue, setEditorValue] = useState(initialValue);
  const quillRef = useRef(null);

  useEffect(() => {
    setEditorValue(textValue ?? "");
  }, [textValue]);

  const handleChange = (value) => {
    setEditorValue(value);
    setTextValue(value);
  };

  const transformSelection = useCallback((transformFn) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range || range.length === 0) return;

    const text = editor.getText(range.index, range.length);
    const transformedText = transformFn(text);
    const currentFormat = editor.getFormat(range);

    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, transformedText, currentFormat);
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: '1' }, { header: '2' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        ['uppercase', 'lowercase'],
      ],
      handlers: {
        uppercase: () => transformSelection((text) => text.toUpperCase()),
        lowercase: () => transformSelection((text) => text.toLowerCase()),
      },
    },
  }), [transformSelection]);

  useEffect(() => {
    const uppercaseBtn = document.querySelector('.ql-uppercase');
    if (uppercaseBtn) {
      uppercaseBtn.innerHTML = 'A↑';
    }
    const lowercaseBtn = document.querySelector('.ql-lowercase');
    if (lowercaseBtn) {
      lowercaseBtn.innerHTML = 'a↓';
    }
  }, []);

  return (
    <div className={styles.textEditorContainer}>
      <ReactQuill
        ref={quillRef}
        value={editorValue ?? ""}
        onChange={handleChange}
        modules={modules}
        className="quillEditor"
      />
    </div>
  );
}
