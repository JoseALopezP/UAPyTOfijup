'use client'
import styles from '../MinutaJuicio.module.css'
import { generatePDF } from '@/utils/resuelvoUtils';

export default function EditBlock({ selectedList }) {
    
    const handleDescargarConsolidada = () => {
        if (!selectedList || selectedList.length === 0) {
            alert("Debe seleccionar al menos un bloque para consolidar.");
            return;
        }

        // Ordenar por fecha y hora
        const sortedList = [...selectedList].sort((a, b) => {
            const dateA = new Date(a.fecha.split('').slice(4,8).join('') + '-' + a.fecha.split('').slice(2,4).join('') + '-' + a.fecha.split('').slice(0,2).join('') + 'T' + a.hora);
            const dateB = new Date(b.fecha.split('').slice(4,8).join('') + '-' + b.fecha.split('').slice(2,4).join('') + '-' + b.fecha.split('').slice(0,2).join('') + 'T' + b.hora);
            return dateA.getTime() - dateB.getTime();
        });

        // Usar el primer bloque como base para carátula y metadatos
        const baseAud = { ...sortedList[0] };

        // Concatenar cuerpos de minutas
        let consolidatedMinuta = "";
        sortedList.forEach(aud => {
            if (aud.minuta) {
                consolidatedMinuta += aud.minuta + "<br/>";
            }
        });

        // Capturar Resuelvo del último bloque
        let finalResuelvo = "";
        for (let i = sortedList.length - 1; i >= 0; i--) {
            if (sortedList[i].resuelvoText) {
                finalResuelvo = sortedList[i].resuelvoText;
                break;
            }
        }

        // Asignar datos consolidados
        baseAud.minuta = consolidatedMinuta;
        baseAud.resuelvoText = finalResuelvo;
        // El tipo DEBATE DEL JUICIO ORAL ya asegura que no tendrá formato automático gracias a minutaPrep.js
        
        // Cierre se puede limpiar o dejar el del último
        baseAud.cierre = sortedList[sortedList.length - 1].cierre || "";

        // Generar PDF (usamos la fecha actual o la fecha del baseAud para dateToUse si es requerido por generatePDF)
        generatePDF(baseAud, new Date().toISOString().split('T')[0].replace(/-/g, ''));
    };

    return (
        <section className={`${styles.editBlock}`}>
            <div className={`${styles.leftSide}`}>
                {selectedList && selectedList.length > 0 ? (
                    <div className={styles.consolidationPanel}>
                        <h3>Bloques Seleccionados ({selectedList.length})</h3>
                        <p>Se consolidarán los cuerpos de minuta y se extraerá el Resuelvo del último bloque.</p>
                        <button type="button" className={`${styles.buttonSearch}`} onClick={handleDescargarConsolidada}>
                            DESCARGAR MINUTA CONSOLIDADA
                        </button>
                    </div>
                ) : (
                    <p>Seleccione bloques de la lista para consolidar la Minuta del Juicio.</p>
                )}
            </div>
            <div className={`${styles.rightSide}`}></div>
        </section>
    );
}