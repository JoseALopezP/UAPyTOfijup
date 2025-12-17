import styles from './Carga-Juicio.module.css';
import { useCallback, useState } from 'react';

export function TestigoEditList({ setTestigos, testigos, bloquesArray }) {
  const [nuevoTestigo, setNuevoTestigo] = useState(''); const [nuevoDni, setNuevoDni] = useState('');
  const handleAgregarTestigo = () => {
    const nombre = nuevoTestigo.trim(); const dni = nuevoDni.trim();
    if (!nombre) return;
    setTestigos(prev => {
      if (prev.some(t => t.nombre === nombre)) return prev;
      return [...prev, { nombre, dni: dni || '', fecha: [] }];
    });
    setNuevoTestigo(''); setNuevoDni('');
  };
  const handleEliminarTestigo = (nombre) => { setTestigos(prev => prev.filter(t => t.nombre !== nombre)); };
  const handleDateToggle = useCallback((audId, nombre, fecha, horaBloque) => {
    console.log(bloquesArray)
    console.log(testigos)
    setTestigos(prev => prev.map(testigo => {
      if (testigo.nombre !== nombre) return testigo;
      const yaExiste = testigo.fecha?.some(f => f.fecha === fecha);
      return { ...testigo, fecha: yaExiste ? testigo.fecha.filter(f => f.fecha !== fecha) : [...(testigo.fecha || []), { fecha, hora: horaBloque, asistencia: false, complete: false, audid: audId }] };
    }));
  }, [setTestigos]);
  const actualizarHora = (testigoNombre, index, nuevaHora, nuevosMinutos) => {
    const horaFormateada = `${String(nuevaHora)}:${String(nuevosMinutos)}`;
    setTestigos(prev => prev.map(t => {
      if (t.nombre !== testigoNombre) return t;
      return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, hora: horaFormateada } : f) };
    }));
  };
  const handleDniChange = (nombre, nuevoDni) => {
    setTestigos(prev => prev.map(t => t.nombre === nombre ? { ...t, dni: nuevoDni } : t));
  };
  return (
    <section className={styles.TestigoEditList}>
      <div className={styles.agregarTestigo}>
        <input type="text" placeholder="Nombre del testigo" value={nuevoTestigo} onChange={(e) => setNuevoTestigo(e.target.value)} />
        <input type="text" placeholder="DNI (opcional)" value={nuevoDni} onChange={(e) => setNuevoDni(e.target.value)} />
        <button type="button" onClick={handleAgregarTestigo}>Agregar testigo</button>
      </div>
      {testigos && testigos.map((testigo) => (
        <div key={testigo.nombre} className={styles.testigoCard}>
          <div className={styles.testigoHeader}>
            <span className={styles.nombreTestigo}>{testigo.nombre}</span>
            <span className={styles.dniInputTestigo}>
              <label>DNI:</label>
              <input type="text" value={testigo.dni || ''} onChange={(e) => handleDniChange(testigo.nombre, e.target.value)} placeholder="Ingrese DNI" />
            </span>
            <button type="button" className={styles.deletButton} onClick={() => handleEliminarTestigo(testigo.nombre)}>✖</button>
          </div>

          <div className={styles.bloquesWrapper}>
            {bloquesArray.map((bloque) => {
              const fecha = `${bloque.fecha}`; const horaBloque = bloque.hora;
              const asignado = testigo.fecha?.some((f) => f.fecha === fecha);
              return (
                <button key={bloque.audId} type="button" className={asignado ? styles.asignado : styles.noAsignado} onClick={() => handleDateToggle(bloque.audId, testigo.nombre, fecha, horaBloque)}>
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
                          <input className={styles.inputHora} type="text" min="0" max="23" value={h} onChange={(e) => actualizarHora(testigo.nombre, index, e.target.value, m)} /> :
                          <input className={styles.inputHora} type="text" min="0" max="59" value={m} onChange={(e) => actualizarHora(testigo.nombre, index, h, e.target.value)} />
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellAsistencia}`}><input type="checkbox" checked={item.asistencia} onChange={(e) => {
                          setTestigos(prev => prev.map((t) => {
                            if (t.nombre !== testigo.nombre) return t;
                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, asistencia: e.target.checked } : f) };
                          }));
                        }} /></td>
                        <td className={`${styles.tableCell} ${styles.cellFinished}`}><input type="checkbox" checked={item.complete} onChange={(e) => {
                          setTestigos(prev => prev.map((t) => {
                            if (t.nombre !== testigo.nombre) return t;
                            return { ...t, fecha: t.fecha.map((f, i) => i === index ? { ...f, complete: e.target.checked } : f) };
                          }));
                        }} /></td>
                      </tr>
                    );
                  })}</tbody></table>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
