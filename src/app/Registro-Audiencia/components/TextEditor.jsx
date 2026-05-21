import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from './TextEditor.module.css';

// Configurar Quill para usar estilos inline en alineación de texto
if (typeof window !== "undefined") {
  try {
    const Quill = ReactQuill.Quill;
    if (Quill) {
      const AlignStyle = Quill.import('attributors/style/align');
      Quill.register(AlignStyle, true);
    }
  } catch (error) {
    console.error("Error registering Quill AlignStyle:", error);
  }
}

const QUILL_MODULES = { toolbar: false };

const TEXT_COLORS = [
  { name: 'Predeterminado', value: false },
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Gris Claro', value: '#d3d3d3' },
  { name: 'Rojo', value: '#ff4d4d' },
  { name: 'Naranja', value: '#ff9900' },
  { name: 'Amarillo', value: '#ffff33' },
  { name: 'Verde', value: '#4caf50' },
  { name: 'Celeste', value: '#33ccff' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Púrpura', value: '#a855f7' },
];

const BG_COLORS = [
  { name: 'Sin Fondo', value: false },
  { name: 'Resaltado Amarillo', value: '#ffff00' },
  { name: 'Resaltado Verde', value: '#00ff00' },
  { name: 'Resaltado Celeste', value: '#00ffff' },
  { name: 'Resaltado Rosa', value: '#ff00ff' },
  { name: 'Resaltado Rojo', value: '#ff0000' },
  { name: 'Resaltado Naranja', value: '#ffa500' },
  { name: 'Resaltado Púrpura', value: '#a855f7' },
];

const toTitleCase = (str) => {
  return str.toLowerCase().replace(/(^|[^a-záéíóúüñ])([a-záéíóúüñ])/gi, (match, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};

export default function TextEditor({ textValue, setTextValue }) {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [formats, setFormats] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null); // 'color' | 'background' | null

  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editorRef.current = editor;

    // Habilitar motor de corrección ortográfica del navegador en español
    if (editor.root) {
      editor.root.setAttribute('spellcheck', 'true');
      editor.root.setAttribute('lang', 'es');
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

  // Cerrar dropdowns si se hace clic fuera de la barra de herramientas
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeDropdown && toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeDropdown]);

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

  return (
    <div>
      <div ref={toolbarRef} className={styles.customToolbar}>
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

        {/* Color de texto */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            title="Color de texto"
            className={`${styles.toolbarBtn} ${activeDropdown === 'color' ? styles.toolbarBtnActive : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
          >
            <span className={styles.colorIconBtn}>
              <span className={styles.boldText}>A</span>
              <span 
                className={styles.colorBar} 
                style={{ backgroundColor: formats.color || '#ffffff' }} 
              />
            </span>
          </button>
          {activeDropdown === 'color' && (
            <div className={styles.colorPalette}>
              {TEXT_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className={c.value ? styles.colorOption : `${styles.colorOption} ${styles.colorOptionDefault}`}
                  style={c.value ? { backgroundColor: c.value } : {}}
                  title={c.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    fmt('color', c.value);
                    setActiveDropdown(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Color de resaltado (fondo) */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            title="Color de resaltado"
            className={`${styles.toolbarBtn} ${activeDropdown === 'background' ? styles.toolbarBtnActive : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'background' ? null : 'background')}
          >
            <span className={styles.colorIconBtn}>
              <span className={styles.highlighterIcon}>✎</span>
              <span 
                className={styles.backgroundBar} 
                style={{ 
                  backgroundColor: formats.background || 'transparent', 
                  border: formats.background ? 'none' : '1.5px dashed #777' 
                }} 
              />
            </span>
          </button>
          {activeDropdown === 'background' && (
            <div className={styles.colorPalette}>
              {BG_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className={c.value ? styles.colorOption : `${styles.colorOption} ${styles.colorOptionDefault}`}
                  style={c.value ? { backgroundColor: c.value } : {}}
                  title={c.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    fmt('background', c.value);
                    setActiveDropdown(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

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

        {/* Alineación */}
        <button
          type="button"
          title="Alinear a la izquierda"
          className={(!formats.align || formats.align === 'left') ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('align', false); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="15" y1="18" x2="3" y2="18"></line>
          </svg>
        </button>
        <button
          type="button"
          title="Alinear al centro"
          className={formats.align === 'center' ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('align', 'center'); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="10" x2="6" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="18" y1="18" x2="6" y2="18"></line>
          </svg>
        </button>
        <button
          type="button"
          title="Alinear a la derecha"
          className={formats.align === 'right' ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('align', 'right'); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="9" y2="18"></line>
          </svg>
        </button>
        <button
          type="button"
          title="Justificar"
          className={formats.align === 'justify' ? `${styles.toolbarBtn} ${styles.toolbarBtnActive}` : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); fmt('align', 'justify'); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="3" y2="18"></line>
          </svg>
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
        <button type="button" title="Convertir a Mayúsculas Iniciales" className={styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); transformSelection(toTitleCase); }}>
          Aa
        </button>
      </div>

      <div className={styles.quillContainer} spellcheck="true">
        <ReactQuill
          ref={quillRef}
          value={textValue}
          onChange={handleChange}
          modules={QUILL_MODULES}
        />
      </div>
    </div>
  );
}
