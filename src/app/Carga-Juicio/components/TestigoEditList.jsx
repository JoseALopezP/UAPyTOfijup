import styles from './Carga-Juicio.module.css';
import { useCallback } from 'react';

export function TestigoEditList({ setTestigos, testigos, bloques }) {

  const handleDateToggle = useCallback((nombre, tiempo) => {
    setTestigos(prev =>
      prev.map(testigo => {
        if (testigo.nombre !== nombre) return testigo;

        const yaExiste = testigo.fecha?.some(f => f.tiempo === tiempo);

        return {
          ...testigo,
          fecha: yaExiste
            ? testigo.fecha.filter(f => f.tiempo !== tiempo)
            : [...(testigo.fecha || []), { tiempo, asistencia: false, complete: false }]
        };
      })
    );
  }, [setTestigos]);

  return (
    <section className={styles.TestigoEditList}>
      {testigos && testigos.map(testigo => (
        <div key={testigo.nombre} className={styles.testigoCard}>
          <span className={styles.nombre}>{testigo.nombre}</span>

          <div className={styles.bloquesWrapper}>
            {bloques.map(bloque => {
              const tiempo = `${bloque.fecha}-${bloque.hora}`;
              const asignado = testigo.fecha?.some(f => f.tiempo === tiempo);

              return (
                <button
                  key={tiempo}
                  type='button'
                  className={asignado ? styles.asignado : styles.noAsignado}
                  onClick={() => handleDateToggle(testigo.nombre, tiempo)}
                >
                  {bloque.fecha} {bloque.hora}
                </button>
              );
            })}
          </div>
          {testigo.fecha?.length > 0 && (
            <div className={styles.fechasAsignadas}>
              <h4>Fechas asignadas:</h4>
              {testigo.fecha.map((item, index) => (
                <div key={index} className={styles.fechaItem}>
                  <span>{item.tiempo}</span>
                  <label>
                    Asistencia:
                    <input
                      type="checkbox"
                      checked={item.asistencia}
                      onChange={(e) => {
                        setTestigos(prev =>
                          prev.map(t => {
                            if (t.nombre !== testigo.nombre) return t;
                            return {
                              ...t,
                              fecha: t.fecha.map((f, i) =>
                                i === index ? { ...f, asistencia: e.target.checked } : f
                              )
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
                        setTestigos(prev =>
                          prev.map(t => {
                            if (t.nombre !== testigo.nombre) return t;
                            return {
                              ...t,
                              fecha: t.fecha.map((f, i) =>
                                i === index ? { ...f, complete: e.target.checked } : f
                              )
                            };
                          })
                        );
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
