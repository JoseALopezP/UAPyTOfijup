import React, { useRef, useEffect, useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from './TextEditor.module.css'

// Sin toolbar nativa de Quill — usamos la nuestra
const QUILL_MODULES = { toolbar: false };

export default function TextEditor({ textValue, setTextValue }) {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [formats, setFormats] = useState({});

  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editorRef.current = editor;

    // Contenido inicial
    if (textValue) {
      editor.clipboard.dangerouslyPasteHTML(textValue);
    }

    // Guardar selección y formatos activos
    editor.on('selection-change', (range) => {
      if (range) {
        savedRangeRef.current = range;
        setFormats(editor.getFormat(range));
      }
    });
    editor.on('text-change', () => {
      const sel = editor.getSelection();
      if (sel) setFormats(editor.getFormat(sel));
    });
  }, []);

  const handleChange = (value) => {
    if (setTextValue) setTextValue(value);
  };

  // Aplica un formato — e.preventDefault() en onMouseDown preserva la selección
  const fmt = (format, value) => {
    const editor = editorRef.current;
    if (!editor) return;
    const range = editor.getSelection() || savedRangeRef.current;
    if (!range) return;

    if (range.length > 0) {
      const current = editor.getFormat(range);
      const newVal = value !== undefined ? value : !current[format];
      editor.formatText(range.index, range.length, format, newVal, 'user');
    } else {
      const current = editor.getFormat();
      editor.format(format, value !== undefined ? value : !current[format], 'user');
    }
    setFormats(editor.getFormat(editor.getSelection() || range));
  };

  const transformSelection = (transformer) => {
    const editor = editorRef.current;
    if (!editor) return;
    const range = editor.getSelection() || savedRangeRef.current;
    if (!range || range.length === 0) return;
    const text = editor.getText(range.index, range.length);
    const transformed = transformer(text);
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, transformed);
  };

  const on = (format, val) =>
    val !== undefined ? formats[format] === val : !!formats[format];

  const btn = (label, format, val, title) => (
    <button
      type="button"
      title={title}
      className={on(format, val) ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
      onMouseDown={(e) => { e.preventDefault(); fmt(format, val); }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className={styles.customToolbar}>
        {/* Formato de texto */}
        <button type="button" title="Negrita (Ctrl+B)"
          className={on('bold') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('bold'); }}>
          <strong>B</strong>
        </button>
        <button type="button" title="Cursiva (Ctrl+I)"
          className={on('italic') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('italic'); }}>
          <em>I</em>
        </button>
        <button type="button" title="Subrayado (Ctrl+U)"
          className={on('underline') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('underline'); }}>
          <u>U</u>
        </button>

        <span className={styles.toolbarSep} />

        {/* Encabezados */}
        <select
          className={styles.toolbarSelect}
          value={formats.header || ''}
          onChange={(e) => {
            const val = e.target.value;
            fmt('header', val ? parseInt(val) : false);
          }}>
          <option value="">Normal</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>

        <span className={styles.toolbarSep} />

        {/* Listas */}
        <button type="button" title="Lista con viñetas"
          className={on('list', 'bullet') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('list', on('list', 'bullet') ? false : 'bullet'); }}>
          •≡
        </button>
        <button type="button" title="Lista numerada"
          className={on('list', 'ordered') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('list', on('list', 'ordered') ? false : 'ordered'); }}>
          1.≡
        </button>

        <span className={styles.toolbarSep} />

        {/* Mayúsculas / minúsculas */}
        <button type="button" title="Convertir a MAYÚSCULAS" className={styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); transformSelection(t => t.toUpperCase()); }}>
          A↑
        </button>
        <button type="button" title="Convertir a minúsculas" className={styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); transformSelection(t => t.toLowerCase()); }}>
          a↓
        </button>
      </div>

      <div className={styles.quillContainer}>
        <ReactQuill
          ref={quillRef}
          onChange={handleChange}
          modules={QUILL_MODULES}
        />
      </div>
    </div>
  );
}
