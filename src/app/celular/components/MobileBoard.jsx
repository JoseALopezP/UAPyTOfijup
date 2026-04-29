'use client'
import { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/context New/DataContext';
import { todayFunction } from '@/utils/dateUtils';
import { generateMinutaSection } from '@/utils/resuelvoUtils';
import { useRouter } from 'next/navigation';
import styles from './MobileBoard.module.css';

export default function MobileBoard() {
    const { updateByDateView, bydateView, realTime, getByDate } = useContext(DataContext);
    const [selectedAud, setSelectedAud] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [filterValue, setFilterValue] = useState('');

    const tick = () => {
        updateByDateView(todayFunction());
    };

    useEffect(() => {
        const checkDesktop = () => {
            const isDesktop = !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && window.innerWidth > 768;
            if (isDesktop) {
                router.push('/tablero');
            }
        };
        
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        
        tick();
        const timerID = setInterval(() => tick(), 300000); // 5 minutes
        
        return () => {
            clearInterval(timerID);
            window.removeEventListener('resize', checkDesktop);
        };
    }, [router]);

    const currentHour = new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});

    const getSortGroup = (el) => {
        const isDemorada = el.estado === 'PROGRAMADA' && currentHour > el.hora;
        if (el.estado === 'EN_CURSO') return 1;
        if (isDemorada) return 2;
        if (el.estado === 'RESUELVO' || el.estado === 'FINALIZADA' || el.estado === 'CANCELADA') return 4;
        return 3; // PROGRAMADA, CUARTO_INTERMEDIO, REPROGRAMADA
    };

    const formatSala = (sala) => {
        let s = String(sala || '').trim();
        if (s.toUpperCase().startsWith('SALA')) s = s.substring(4).trim();
        if (s.toUpperCase().startsWith('S') && s.length > 1 && !isNaN(s.substring(1).trim())) s = s.substring(1).trim();
        return `S${s}`;
    };

    const audiencias = bydateView ? Object.values(bydateView)
        .filter(el => el && el.numeroLeg && el.hora && el.id !== 'info' && el.id !== 'information')
        .filter(el => {
            if (!filterValue) return true;
            const searchableText = `${el.hora} ${el.sala} ${el.numeroLeg} ${el.tipo} ${el.tipo2 || ''} ${el.tipo3 || ''} ${el.juez || ''} ${el.estado || ''}`.toLowerCase();
            return filterValue.toLowerCase().split(' ').every(word => searchableText.includes(word));
        })
        .sort((a, b) => {
            const groupA = getSortGroup(a);
            const groupB = getSortGroup(b);
            
            if (groupA !== groupB) return groupA - groupB;

            const timeA = (a.hora || '').split(':').join('');
            const timeB = (b.hora || '').split(':').join('');
            if (timeA !== timeB) return timeA - timeB;
            return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
        }) : [];

    const handleSelect = async (audView) => {
        setIsLoading(true);
        setValidationError(null);
        
        try {
            const today = todayFunction();
            const fullAuds = await getByDate(today);
            
            // Find the full record by ID or by legajo + hour
            const aud = fullAuds.find(a => 
                (a.id === audView.id) || 
                (a.numeroLeg === audView.numeroLeg && a.hora === audView.hora)
            );

            if (!aud) {
                setValidationError("No se pudo encontrar el detalle completo de esta audiencia.");
                return;
            }

            // Validation logic on full data
            if (!aud.caratula) {
                setValidationError("No se puede mostrar el detalle: Falta la Carátula de la audiencia.");
                return;
            }
            if (!aud.minuta && !aud.resuelvoText) {
                setValidationError("No se puede mostrar el detalle: Esta audiencia aún no tiene contenido de texto (Minuta o Resuelvo).");
                return;
            }
            if (!aud.juez) {
                setValidationError("No se puede mostrar el detalle: La audiencia no tiene Juez asignado.");
                return;
            }

            setSelectedAud(aud);
        } catch (error) {
            console.error(error);
            setValidationError("Ocurrió un error al intentar cargar los datos de la audiencia.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedAud(null);
        setValidationError(null);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <input 
                    type="text" 
                    className={styles.searchBar} 
                    placeholder="Buscar por juez, legajo, tipo..." 
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                />
            </header>
            
            <div className={styles.list}>
                {audiencias.map((el) => {
                    const statusClass = (el.estado === 'PROGRAMADA' && (currentHour > el.hora)) 
                        ? 'DEMORADA' 
                        : (el.estado === 'RESUELVO' ? 'FINALIZADA' : el.estado);

                    return (
                        <div key={(el.id || el.numeroLeg) + el.hora} className={styles.card} onClick={() => handleSelect(el)}>
                            <div className={`${styles.statusLine} ${styles[statusClass] || ''}`}>
                                {statusClass ? statusClass.split('_').join(' ') : 'NA'}
                            </div>
                            <div className={styles.cardBody}>
                                <span className={styles.hora}>{el.hora}</span>
                                <span className={styles.sala}>{formatSala(el.sala)}</span>
                                <span className={styles.legajo}>{el.numeroLeg}</span>
                                <span className={styles.tipo}>
                                    {el.tipo} {el.tipo2 ? `- ${el.tipo2}` : ''} {el.tipo3 ? `- ${el.tipo3}` : ''}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isLoading && (
                <div className={styles.overlay}>
                    <div className={styles.loadingSpinner}>Cargando detalle...</div>
                </div>
            )}

            {validationError && (
                <div className={styles.overlay} onClick={handleClose}>
                    <div className={styles.errorContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={handleClose}>X</button>
                        <div className={styles.errorText}>
                            <p>{validationError}</p>
                        </div>
                    </div>
                </div>
            )}

            {selectedAud && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <button className={styles.closeBtn} onClick={handleClose}>X</button>
                        <div className={styles.minutaText}>
                            {generateMinutaSection(selectedAud, todayFunction()).map((section, idx) => (
                                <div key={idx} className={styles.section}>
                                    {section.title && <span className={styles.bold}>{section.title} </span>}
                                    {section.text && (
                                        <span>
                                            {Array.isArray(section.text) 
                                                ? section.text.map((t, i) => (
                                                    <span key={i} className={t.bold ? styles.textBold : ''}>
                                                        {t.text}
                                                    </span>
                                                  ))
                                                : section.text
                                            }
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
