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
    if (!id) return;
    setTestigos(prev => (prev || []).map(testigo => {
      if (testigo.id !== id) return testigo;
      const targetAudId = audId;
      const yaExiste = testigo.fecha?.some(f => (f.audid || f.audId) === targetAudId);
      return { 
        ...testigo, 
        fecha: yaExiste 
          ? testigo.fecha.filter(f => (f.audid || f.audId) !== targetAudId) 
          : [...(testigo.fecha || []), { fecha, hora: horaBloque, asistencia: false, complete: false, audid: targetAudId }] 
      };
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
          <div key={testigo.id} className={`${styles.testigoCard} ${isExpanded ? styles.testigoCardExpanded : ''}`}>
            <div className={styles.testigoHeader} onClick={() => setExpandedId(isExpanded ? null : testigo.id)}>
              <div className={styles.testigoInfoSummary}>
                <span className={styles.testigoAvatar}>{testigo.nombre?.charAt(0) || '?'}</span>
                <div className={styles.testigoIdentity}>
                  {isEditing ? (
                    <input
                      type="text"
                      className={styles.editNombreInput}
                      value={testigo.nombre}
                      onChange={(e) => {
                        setTestigos(prev => prev.map(t => t.id === testigo.id ? { ...t, nombre: e.target.value } : t));
                      }}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className={styles.testigoNameDisplay}>{testigo.nombre || 'Sin nombre'}</span>
                  )}
                  <div className={styles.testigoSubtext} onClick={e => e.stopPropagation()}>
                    <span className={styles.dniLabel}>DNI:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.editDniInput}
                        value={testigo.dni || ''}
                        onChange={(e) => handleDniChange(testigo.id, e.target.value)}
                        placeholder="DNI"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className={styles.dniValue}>{testigo.dni || '---'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.testigoActions} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${isEditing ? styles.actionBtnActive : ''}`}
                  onClick={() => setEditingId(isEditing ? null : testigo.id)}
                  title={isEditing ? "Guardar" : "Editar"}
                >
                  {isEditing ? '💾' : '✏️'}
                </button>
                <button
                  type="button"
                  className={styles.deleteActionBtn}
                  onClick={() => handleEliminarTestigo(testigo.id)}
                  title="Eliminar"
                >
                  ✖
                </button>
                <div 
                  className={`${styles.expandChevron} ${isExpanded ? styles.expandChevronActive : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : testigo.id)}
                >
                  ▼
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className={styles.testigoDetails} onClick={e => e.stopPropagation()}>
                <div className={styles.sectionHeader}>Asignación de Bloques</div>

          <div className={styles.bloquesWrapper}>
            {bloquesArray && bloquesArray.map((bloque) => {
              const fecha = `${bloque.fecha}`; const horaBloque = bloque.hora;
              const asignado = testigo.fecha?.some((f) => (f.audid || f.audId) === bloque.audId);
              return (
                <button key={bloque.audId} type="button" className={asignado ? styles.asignado : styles.noAsignado} onClick={() => handleDateToggle(bloque.audId, testigo.id, fecha, horaBloque)}>
                  {bloque.fecha.slice(0, 2)}/{bloque.fecha.slice(2, 4)}/{bloque.fecha.slice(6, 8)} {bloque.hora}
                </button>
              );
            })}
          </div>
                <div className={styles.sectionHeader}>Seguimiento y Asistencia</div>
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
                            <td className={styles.cellFecha}>
                                {item.fecha.slice(0, 2)}/{item.fecha.slice(2, 4)}/{item.fecha.slice(6, 8)}
                            </td>
                            <td className={styles.cellCitaHora}>
                              <div className={styles.timeInputPair}>
                                <input className={styles.inputHora} type="text" value={h} onChange={(e) => actualizarHora(testigo.id, index, e.target.value, m)} />
                                <span>:</span>
                                <input className={styles.inputHora} type="text" value={m} onChange={(e) => actualizarHora(testigo.id, index, h, e.target.value)} />
                              </div>
                            </td>
                            <td className={styles.cellAsistencia}>
                                <div className={styles.customCheck}>
                                    <input type="checkbox" checked={item.asistencia} onChange={(e) => {
                                        setTestigos(prev => (prev || []).map((t) => {
                                            if (t.id !== testigo.id) return t;
                                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, asistencia: e.target.checked } : f) };
                                        }));
                                    }} />
                                </div>
                            </td>
                            <td className={styles.cellFinished}>
                                <div className={styles.customCheck}>
                                    <input type="checkbox" checked={item.complete} onChange={(e) => {
                                        setTestigos(prev => (prev || []).map((t) => {
                                            if (t.id !== testigo.id) return t;
                                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, complete: e.target.checked } : f) };
                                        }));
                                    }} />
                                </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </section>
  );
}
