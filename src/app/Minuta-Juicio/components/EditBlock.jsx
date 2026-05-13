'use client'
import { useState, useMemo } from 'react'
import styles from '../MinutaJuicio.module.css'
import { generateResuelvoSection } from '@/utils/resuelvoUtils'
import { minutaPrep } from '@/utils/minutaPrep'
import { PDFGenerator } from '@/utils/pdfUtils'
import { removeHtmlTags } from '@/utils/removeHtmlTags'
import dynamic from 'next/dynamic'
const TextEditor = dynamic(() => import('../../Registro-Audiencia/components/TextEditor'), { ssr: false })

export default function EditBlock({ selectedList }) {
    const [editableBody, setEditableBody] = useState('');
    const [editableResuelvo, setEditableResuelvo] = useState('');
    const [initialized, setInitialized] = useState(false);

    // Merge all parties from all selected audiencias (union, no duplicates)
    const consolidatedParties = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return null;

        const mergeByName = (arrays, key) => {
            const map = new Map();
            arrays.forEach(arr => {
                (arr || []).forEach(item => {
                    const name = item.nombre || item.name || '';
                    if (name && !map.has(name)) map.set(name, item);
                });
            });
            return Array.from(map.values());
        };

        return {
            mpf: mergeByName(selectedList.map(a => a.mpf)),
            defensa: mergeByName(selectedList.map(a => a.defensa)),
            imputado: mergeByName(selectedList.map(a => a.imputado)),
            partes: mergeByName(selectedList.map(a => a.partes)),
            juez: selectedList[0]?.juez || '',
            sala: selectedList[0]?.sala || '',
            ufi: selectedList[0]?.ufi || '',
            defensoria: selectedList[0]?.defensoria || '',
            operador: selectedList[0]?.operador || '',
            tipo: selectedList[0]?.tipo || '',
            tipo2: selectedList[0]?.tipo2 || '',
            tipo3: selectedList[0]?.tipo3 || '',
            numeroLeg: selectedList[0]?.numeroLeg || '',
            saeNum: selectedList[0]?.saeNum || '',
            caratula: selectedList[0]?.caratula || '',
            hora: selectedList[0]?.hora || '',
            hitos: selectedList[0]?.hitos || [],
        };
    }, [selectedList]);

    // Concatenate all minuta bodies from selected audiencias
    const concatenatedBody = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return '';
        return selectedList
            .sort((a, b) => {
                const dateA = a.fecha || '';
                const dateB = b.fecha || '';
                return dateA.localeCompare(dateB);
            })
            .map(aud => aud.minuta || '')
            .filter(m => m.trim() !== '')
            .join('<br><hr><br>');
    }, [selectedList]);

    // Find the resuelvo from the last block (the one that has content)
    const lastResuelvo = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return '';
        const withResuelvo = selectedList.filter(a => a.resuelvoText && removeHtmlTags(a.resuelvoText).trim() !== '');
        if (withResuelvo.length === 0) return '';
        return withResuelvo[withResuelvo.length - 1].resuelvoText || '';
    }, [selectedList]);

    // Initialize editable fields when selection changes
    useMemo(() => {
        if (selectedList && selectedList.length > 0) {
            setEditableBody(concatenatedBody);
            setEditableResuelvo(lastResuelvo);
            setInitialized(true);
        } else {
            setEditableBody('');
            setEditableResuelvo('');
            setInitialized(false);
        }
    }, [concatenatedBody, lastResuelvo]);

    const handleDownload = () => {
        if (!consolidatedParties || !selectedList || selectedList.length === 0) return;

        // Use the first audiencia's date for the caratula
        const firstAud = selectedList[0];
        const date = firstAud.fecha || '';

        // Build consolidated item for PDF generation
        const consolidatedItem = {
            ...consolidatedParties,
            minuta: editableBody,
            resuelvoText: editableResuelvo,
            cierre: '', // No cierre for debate
        };

        // Build caratula sections
        const caratulaSections = generateResuelvoSection(consolidatedItem, date);

        // Build body: parse the editable body as minuta content
        const bodyItem = { ...consolidatedItem, minuta: editableBody, resuelvoText: '', cierre: '' };
        const bodyParts = minutaPrep(bodyItem);

        // Build resuelvo section (manual text, no automatic "El Sr. Juez motiva y resuelve...")
        const resuelvoSections = [];
        if (editableResuelvo && removeHtmlTags(editableResuelvo).trim() !== '') {
            // Split by lines and create text sections
            const resuelvoLines = editableResuelvo
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]*>/g, '')
                .split('\n')
                .filter(l => l.trim() !== '');

            resuelvoSections.push({
                text: [{ text: '\nResuelvo:', bold: true }]
            });
            resuelvoSections.push({
                text: resuelvoLines.map(line => ({ text: line, bold: false }))
            });
        }

        const allSections = [...caratulaSections, ...bodyParts, ...resuelvoSections];
        PDFGenerator(allSections, consolidatedItem.numeroLeg, true);
    };

    if (!selectedList || selectedList.length === 0) {
        return (
            <section className={`${styles.editBlock}`}>
                <div className={`${styles.editBlockEmpty}`}>
                    <p>Seleccione bloques de debate para generar la minuta final</p>
                </div>
            </section>
        );
    }

    return (
        <section className={`${styles.editBlock}`}>
            <div className={`${styles.editBlockHeader}`}>
                <h3>Minuta Final de Juicio — {consolidatedParties?.numeroLeg}</h3>
                <span className={`${styles.editBlockHeaderInfo}`}>
                    <p>{selectedList.length} bloque{selectedList.length > 1 ? 's' : ''} seleccionado{selectedList.length > 1 ? 's' : ''}</p>
                    <button type='button' className={`${styles.buttonDownloadFinal}`} onClick={handleDownload}>
                        DESCARGAR MINUTA FINAL
                    </button>
                </span>
            </div>
            <div className={`${styles.editBlockContent}`}>
                <div className={`${styles.editBlockSection}`}>
                    <label className={`${styles.editBlockLabel}`}>Cuerpo de la Minuta (todos los bloques)</label>
                    <TextEditor textValue={editableBody} setTextValue={setEditableBody} />
                </div>
                <div className={`${styles.editBlockSection}`}>
                    <label className={`${styles.editBlockLabel}`}>Resuelvo Final</label>
                    <TextEditor textValue={editableResuelvo} setTextValue={setEditableResuelvo} />
                </div>
            </div>
        </section>
    );
}