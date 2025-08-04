import { useContext, useState, useEffect, useRef } from 'react'; // Importa useRef
import styles from '../SituacionCorporal.module.css';
import { DataContext } from '@/context/DataContext';
import { SitCorporalSelectDate } from './SitCorporalSelectDate';
import { todayFunction } from '@/utils/dateUtils';
import SitCorporalList from './SitCorporalList';

export default function SitCorporalBlock() {
    const [dateToUSe, setDateToUse] = useState(null);
    const [legSearch, setLegSearch] = useState('');
    const { updateByDate, bydate } = useContext(DataContext);
    const mensajeCopiaRef = useRef(null);
    const [manualCopyText, setManualCopyText] = useState('');

    const handleSave = (newDate) => {
        setDateToUse(newDate);
        localStorage.setItem('dateToUse', newDate);
    };
    function generarTextoParaGoogleSheets(dataArray) {
        if (!dataArray || !Array.isArray(dataArray)) {
            return '';
        }
        return dataArray.map(el => el.numeroLeg).join('\n');
    }
    async function copiarLegajosParaSheets() {
        const textoACopiar = generarTextoParaGoogleSheets(bydate);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textoACopiar);
                if (mensajeCopiaRef.current) {
                    mensajeCopiaRef.current.textContent = '¡Legajos copiados! Ya puedes pegarlos en tu planilla.';
                    setManualCopyText('');
                }
                setTimeout(() => {
                    if (mensajeCopiaRef.current) {
                        mensajeCopiaRef.current.textContent = '';
                    }
                }, 3000);
            } catch (err) {
                console.error('Error al copiar legajos con Clipboard API: ', err);
                if (mensajeCopiaRef.current) {
                    mensajeCopiaRef.current.textContent = 'Error al copiar. Por favor, copia el texto de forma manual o asegúrate de que la página esté servida en HTTPS.';
                }
                setManualCopyText(textoACopiar);
            }
        } else {
            if (mensajeCopiaRef.current) {
                mensajeCopiaRef.current.textContent = 'Tu navegador no soporta la copia automática. Por favor, copia el texto siguiente manualmente:';
            }
            setManualCopyText(textoACopiar);
        }
    }
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem('dateToUse');
            setDateToUse(storedData || todayFunction());
        }
    }, []);
    useEffect(() => {
        updateByDate(dateToUSe)
    }, [dateToUSe]);

    return (
    <div className={`${styles.sitCorporalContainer}`}>
        <p ref={mensajeCopiaRef} id="mensajeCopiaLegajos" className={styles.copyMessage}></p>
        {dateToUSe && (
            <SitCorporalSelectDate
                dateFunction={handleSave}
                date={dateToUSe}
                legSearch={legSearch}
                setLegSearch={setLegSearch}
                copyLeg={copiarLegajosParaSheets}
                mensajeCopiaRef={mensajeCopiaRef}
            />
        )}
        {manualCopyText && (
            <textarea
                id="tempCopyTextArea"
                readOnly
                value={manualCopyText}
                className={styles.manualCopyTextArea}
                onFocus={(e) => e.target.select()}
            />
        )}

        <SitCorporalList list={bydate} date={dateToUSe} legSearch={legSearch}/>
    </div>
);
}