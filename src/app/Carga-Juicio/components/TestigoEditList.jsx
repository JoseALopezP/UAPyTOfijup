import styles from './Carga-Juicio.module.css';
import { useCallback, useState } from 'react';

export function TestigoEditList({ setTestigos, testigos, bloquesArray }) {
  const [nuevoTestigo, setNuevoTestigo] = useState(''); const [nuevoDni, setNuevoDni] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleAgregarTestigo = () => {
    const nombre = nuevoTestigo.trim(); const dni = nuevoDni.trim();
    if (!nombre) return;
    setTestigos(prev => {
      const existing = prev || [];
      if (existing.some(t => t.nombre === nombre)) return existing;
      return [...existing, { id: crypto.randomUUID(), nombre, dni: dni || '', fecha: [] }];
    });
    setNuevoTestigo(''); setNuevoDni('');
  };
  const handleEliminarTestigo = (id) => { 
    if (window.confirm("¿Está seguro de que desea eliminar este testigo?")) {
      setTestigos(prev => prev.filter(t => t.id !== id)); 
    }
  };
  const handleDateToggle = useCallback((audId, id, fecha, horaBloque) => {
    setTestigos(prev => (prev || []).map(testigo => {
      if (testigo.id !== id) return testigo;
      const yaExiste = testigo.fecha?.some(f => f.fecha === fecha);
      return { ...testigo, fecha: yaExiste ? testigo.fecha.filter(f => f.fecha !== fecha) : [...(testigo.fecha || []), { fecha, hora: horaBloque, asistencia: false, complete: false, audid: audId }] };
    }));
  }, [setTestigos]);
  const actualizarHora = (id, index, nuevaHora, nuevosMinutos) => {
    const horaFormateada = `${String(nuevaHora)}:${String(nuevosMinutos)}`;
    setTestigos(prev => (prev || []).map(t => {
      if (t.id !== id) return t;
      return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, hora: horaFormateada } : f) };
    }));
  };
  const handleDniChange = (id, nuevoDni) => {
    setTestigos(prev => prev.map(t => t.id === id ? { ...t, dni: nuevoDni } : t));
  };
  return (
    <section className={styles.TestigoEditList}>
      <div className={styles.agregarTestigo}>
        <input type="text" placeholder="Nombre del testigo" value={nuevoTestigo} onChange={(e) => setNuevoTestigo(e.target.value)} />
        <input type="text" placeholder="DNI (opcional)" value={nuevoDni} onChange={(e) => setNuevoDni(e.target.value)} />
        <button type="button" onClick={handleAgregarTestigo}>Agregar testigo</button>
      </div>
      {testigos && testigos.map((testigo) => {
        const isExpanded = expandedId === testigo.id;
        const isEditing = editingId === testigo.id;
        return (
          <div key={testigo.id} className={styles.testigoCard}>
            <div className={styles.testigoHeader} style={{ cursor: 'pointer', alignItems: 'center' }} onClick={() => setExpandedId(isExpanded ? null : testigo.id)}>
              <span className={styles.nombreTestigo} onClick={e => isEditing && e.stopPropagation()}>
                {isEditing ? (
                  <input type="text" value={testigo.nombre} onChange={(e) => {
                    setTestigos(prev => prev.map(t => t.id === testigo.id ? { ...t, nombre: e.target.value } : t));
                  }} autoFocus onClick={e => e.stopPropagation()} style={{ width: '120px', backgroundColor: '#2B2B2B', color: '#fff', outline: 'none', border: '1px solid #555', borderRadius: '4px', padding: '4px' }} />
                ) : <span style={{ fontWeight: 600, color: '#fff' }}>{testigo.nombre || 'Sin nombre'}</span>}
              </span>
              <span className={styles.dniInputTestigo} onClick={e => e.stopPropagation()}>
                <label style={{ color: '#aaa', fontSize: '12px' }}>DNI:</label>
                <input type="text" value={testigo.dni || ''} onChange={(e) => handleDniChange(testigo.id, e.target.value)} placeholder="DNI" readOnly={!isEditing} style={{ backgroundColor: isEditing ? '#2B2B2B' : 'transparent', color: '#fff', border: isEditing ? '1px solid #555' : 'none' }} />
              </span>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <span style={{ color: '#888', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '12px' }}>▼</span>
                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }} onClick={() => {
                  if (isEditing) {
                    setEditingId(null);
                  } else {
                    setEditingId(testigo.id);
                  }
                }}>
                  {isEditing ? '✔' : '✏️'}
                </button>
                <button type="button" className={styles.deletButton} style={{ position: 'static', margin: 0, padding: '2px 6px' }} onClick={() => handleEliminarTestigo(testigo.id)}>✖</button>
              </span>
            </div>
            {isExpanded && (
              <div onClick={e => e.stopPropagation()}>

          <div className={styles.bloquesWrapper}>
            {bloquesArray && bloquesArray.map((bloque) => {
              const fecha = `${bloque.fecha}`; const horaBloque = bloque.hora;
              const asignado = testigo.fecha?.some((f) => f.fecha === fecha);
              return (
                <button key={bloque.audId} type="button" className={asignado ? styles.asignado : styles.noAsignado} onClick={() => handleDateToggle(bloque.audId, testigo.id, fecha, horaBloque)}>
                  {bloque.fecha.slice(0, 2)}/{bloque.fecha.slice(2, 4)}/{bloque.fecha.slice(6, 8)} {bloque.hora}
                </button>
              );
            })}
          </div>
          {testigo.fecha?.length > 0 && (
            <div className={styles.fechasAsignadas}>
              <table className={styles.tableFechas}>
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>CITADO</th>
                    <th>ASISTIÓ</th>
                    <th>FINALIZÓ</th>
                  </tr>
                </thead>
                <tbody>
                  {testigo.fecha.map((item, index) => {
                    const [h, m] = item.hora?.split(':') || ['00', '00'];
                    return (
                      <tr key={index} className={styles.fechaItem}>
                        <td className={`${styles.tableCell} ${styles.cellFecha}`}>{item.fecha.slice(0, 2)}/{item.fecha.slice(2, 4)}/{item.fecha.slice(6, 8)}</td>
                        <td className={`${styles.tableCell} ${styles.cellCitaHora}`}>
                          <input className={styles.inputHora} type="text" min="0" max="23" value={h} onChange={(e) => actualizarHora(testigo.id, index, e.target.value, m)} /> :
                          <input className={styles.inputHora} type="text" min="0" max="59" value={m} onChange={(e) => actualizarHora(testigo.id, index, h, e.target.value)} />
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellAsistencia}`}><input type="checkbox" checked={item.asistencia} onChange={(e) => {
                          setTestigos(prev => (prev || []).map((t) => {
                            if (t.id !== testigo.id) return t;
                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, asistencia: e.target.checked } : f) };
                          }));
                        }} /></td>
                        <td className={`${styles.tableCell} ${styles.cellFinished}`}><input type="checkbox" checked={item.complete} onChange={(e) => {
                          setTestigos(prev => (prev || []).map((t) => {
                            if (t.id !== testigo.id) return t;
                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, complete: e.target.checked } : f) };
                          }));
                        }} /></td>
                      </tr>
                    );
                  })}</tbody></table>
            </div>
          )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
