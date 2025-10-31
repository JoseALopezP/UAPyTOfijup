import styles from './Carga-Juicio.module.css';
import { useCallback, useState } from 'react';

export function TestigoEditList({ setTestigos, testigos, bloques }) {
  const [nuevoTestigo, setNuevoTestigo] = useState('');

  const handleAgregarTestigo = () => {
    const nombre = nuevoTestigo.trim();
    if (!nombre) return;
    setTestigos(prev => {
      if (prev.some(t => t.nombre === nombre)) return prev;
      return [...prev, { nombre, fecha: [] }];
    });
    setNuevoTestigo('');
  };

  const handleEliminarTestigo = (nombre) => {
    setTestigos(prev => prev.filter(t => t.nombre !== nombre));
  };

  const handleDateToggle = useCallback((nombre, fecha, horaBloque) => {
    setTestigos(prev =>
      prev.map(testigo => {
        if (testigo.nombre !== nombre) return testigo;
        const yaExiste = testigo.fecha?.some(f => f.fecha === fecha);
        return {
          ...testigo,
          fecha: yaExiste
            ? testigo.fecha.filter(f => f.fecha !== fecha)
            : [
                ...(testigo.fecha || []),
                {
                  fecha,
                  hora: horaBloque,
                  asistencia: false,
                  complete: false,
                },
              ],
        };
      })
    );
  }, [setTestigos]);
  const actualizarHora = (testigoNombre, index, nuevaHora, nuevosMinutos) => {
    const horaFormateada = `${String(nuevaHora).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
    setTestigos(prev =>
      prev.map(t => {
        if (t.nombre !== testigoNombre) return t;
        return {
          ...t,
          fecha: t.fecha.map((f, i) =>
            i === index ? { ...f, hora: horaFormateada } : f
          ),
        };
      })
    );
  };

  return (
    <section className={styles.TestigoEditList}>
      <div className={styles.agregarTestigo}>
        <input
          type="text"
          placeholder="Nombre del testigo"
          value={nuevoTestigo}
          onChange={(e) => setNuevoTestigo(e.target.value)}
        />
        <button type="button" onClick={handleAgregarTestigo}>
          Agregar testigo
        </button>
      </div>

      {testigos &&
        testigos.map((testigo) => (
          <div key={testigo.nombre} className={styles.testigoCard}>
            <div className={styles.testigoHeader}>
              <span className={styles.nombre}>{testigo.nombre}</span>
              <button
                type="button"
                className={styles.eliminar}
                onClick={() => handleEliminarTestigo(testigo.nombre)}
              >
                ✖
              </button>
            </div>

            <div className={styles.bloquesWrapper}>
              {bloques.map((bloque) => {
                const fecha = `${bloque.fecha}`;
                const horaBloque = bloque.hora;
                const asignado = testigo.fecha?.some((f) => f.fecha === fecha);

                return (
                  <button
                    key={fecha}
                    type="button"
                    className={asignado ? styles.asignado : styles.noAsignado}
                    onClick={() =>
                      handleDateToggle(testigo.nombre, fecha, horaBloque)
                    }
                  >
                    {bloque.fecha} {bloque.hora}
                  </button>
                );
              })}
            </div>

            {testigo.fecha?.length > 0 && (
              <div className={styles.fechasAsignadas}>
                <h4>Fechas asignadas:</h4>
                {testigo.fecha.map((item, index) => {
                  const [h, m] = item.hora?.split(':') || ['00', '00'];

                  return (
                    <div key={index} className={styles.fechaItem}>
                      <span>{item.fecha}</span>
                      <label>
                        Hora citación:
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                          <input
                            type="text"
                            min="0"
                            max="23"
                            value={h}
                            onChange={(e) =>
                              actualizarHora(
                                testigo.nombre,
                                index,
                                e.target.value,
                                m
                              )
                            }
                            style={{ width: '50px' }}
                          />
                          :
                          <input
                            type="text"
                            min="0"
                            max="59"
                            value={m}
                            onChange={(e) =>
                              actualizarHora(
                                testigo.nombre,
                                index,
                                h,
                                e.target.value
                              )
                            }
                            style={{ width: '50px' }}
                          />
                        </div>
                      </label>

                      <label>
                        Asistencia:
                        <input
                          type="checkbox"
                          checked={item.asistencia}
                          onChange={(e) => {
                            setTestigos((prev) =>
                              prev.map((t) => {
                                if (t.nombre !== testigo.nombre) return t;
                                return {
                                  ...t,
                                  fecha: t.fecha.map((f, i) =>
                                    i === index
                                      ? { ...f, asistencia: e.target.checked }
                                      : f
                                  ),
                                };
                              })
                            );
                          }}
                        />
                      </label>

                      <label>
                        Completado:
                        <input
                          type="checkbox"
                          checked={item.complete}
                          onChange={(e) => {
                            setTestigos((prev) =>
                              prev.map((t) => {
                                if (t.nombre !== testigo.nombre) return t;
                                return {
                                  ...t,
                                  fecha: t.fecha.map((f, i) =>
                                    i === index
                                      ? { ...f, complete: e.target.checked }
                                      : f
                                  ),
                                };
                              })
                            );
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
    </section>
  );
}