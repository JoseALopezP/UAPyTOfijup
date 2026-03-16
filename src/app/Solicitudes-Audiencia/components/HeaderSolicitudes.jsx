'use client'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext'
import styles from '../SolicitudesAudiencia.module.css'

const STORAGE_KEY = 'app-theme'

export default function HeaderSolicitudes() {
    const { solicitudesPendientes, addSolicitudData, addAudiencia } = useContext(DataContext);
    const [syncStatus, setSyncStatus] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLight, setIsLight] = useState(false);

    // Cargar preferencia guardada al montar
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'light') {
            setIsLight(true)
            document.body.classList.add('light-mode')
        }
    }, [])

    const toggleTheme = () => {
        const next = !isLight
        setIsLight(next)
        if (next) {
            document.body.classList.add('light-mode')
            localStorage.setItem(STORAGE_KEY, 'light')
        } else {
            document.body.classList.remove('light-mode')
            localStorage.setItem(STORAGE_KEY, 'dark')
        }
    }

    const syncSolicitudesHandler = async () => {
        try {
            console.log("[ui] Iniciando sincronización masiva...");
            setIsSyncing(true);
            setSyncStatus('Iniciando...');

            const existingData = Array.isArray(solicitudesPendientes) ? solicitudesPendientes : [];

            const response = await fetch('/api/extraer-solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ existingData, tiposAudiencia: desplegables?.tiposPuma || [] }),
            });

            if (!response.body) throw new Error("No readable stream");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === 'progress') {
                            setSyncStatus(parsed.message);
                        } else if (parsed.type === 'done') {
                            const newItems = parsed.data || [];
                            console.log(`[ui] Guardando ${newItems.length} solicitudes nuevas en Firestore...`);
                            setSyncStatus(`Guardando ${newItems.length} solicitudes...`);
                            for (const item of newItems) {
                                const rowKey = item.linkSol
                                    ? item.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
                                    : `${item.numeroLeg}_${item.fyhcreacion}`;
                                await addSolicitudData(rowKey, item);
                            }
                            setSyncStatus(`✓ ${newItems.length} solicitudes guardadas.`);
                            console.log("[ui] Guardado completo.");
                        } else if (parsed.type === 'error') {
                            setSyncStatus(`Error: ${parsed.error}`);
                        }
                    } catch (e) {
                        console.error("Error parseando chunk JSON:", e, line);
                    }
                }
            }
        } catch (error) {
            console.error("Error de red:", error);
            setSyncStatus(`Error de red: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    }

    const agendarMasivoHandler = async () => {
        try {
            console.log("[ui] Iniciando agendamiento masivo...");
            setIsSyncing(true);
            setSyncStatus('Iniciando Agendamiento...');

            const aAgendar = (solicitudesPendientes || []).filter(s => s.agendar === true && !s.agendada);
            if (aAgendar.length === 0) {
                setSyncStatus('✓ No hay solicitudes para agendar.');
                setIsSyncing(false);
                return;
            }

            for (let i = 0; i < aAgendar.length; i++) {
                const item = aAgendar[i];
                setSyncStatus(`Agendando ${i+1}/${aAgendar.length}: ${item.numeroLeg}...`);
                
                // Reconstruir availablePartsList (lógica idéntica a RowSol.jsx)
                let availablePartsList = [];
                if (Array.isArray(item.partesLegajo) && item.partesLegajo.length > 0) {
                    item.partesLegajo.forEach(p => {
                        availablePartsList.push({ 
                            key: `${p.nombre}-${p.rol}`, nombre: p.nombre, rol: p.rol, 
                            direccion: p.direccion, localidad: p.localidad, telefono: p.telefono, alias: p.alias || '', dni: p.dni || ''
                        });
                    });
                } else if (item.partesLegajo && typeof item.partesLegajo === 'object') {
                    Object.keys(item.partesLegajo).forEach(roleKey => {
                        const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        const persons = item.partesLegajo[roleKey];
                        if (Array.isArray(persons)) {
                            persons.forEach(person => availablePartsList.push({ key: `${person}-${roleName}`, nombre: person, rol: roleName, alias: '', dni: '' }));
                        }
                    });
                }
                (item.partesAgregar || []).forEach(p => {
                    if (p.nombre && p.motivo) {
                        availablePartsList.push({ key: `${p.nombre}-${p.motivo}`, nombre: p.nombre, rol: p.motivo, alias: '', dni: '' });
                    }
                });

                // Preparar PDFs de notificaciones si no se han subido ya
                let documentosBase64 = [];
                if (!item.documentosSubidos && item.notificaciones && item.notificaciones.length > 0) {
                    const { descargarPdfNotificacion } = await import('@/utils/notificacionesAgendamiento');
                    
                    for (const notif of item.notificaciones) {
                        const selectedPartsWithInfo = notif.parts.map(pKey => availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', direccion: '', localidad: '', telefono: '', alias: '' });
                        const firstPart = selectedPartsWithInfo.find(p => p.direccion || p.localidad || p.telefono) || {};
                        const destinatariosStr = selectedPartsWithInfo.map(p => p.alias || p.nombre).join(', ');
                        
                        const tiposStr = (item.tipos || []).join(' - ') || '[TIPO]';
                        const caratulaModStr = ((item.tipos || []).some(t => String(t || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('formalizacion')) && item.caratulaMod) ? item.caratulaMod : (item.caratula || '[CARATULA]');
                        
                        const datosList = {
                            destinatarioNombre: destinatariosStr,
                            destinatarioDomicilio: firstPart.direccion || '[DOMICILIO A COMPLETAR]',
                            destinatarioLocalidad: firstPart.localidad || '[LOCALIDAD A COMPLETAR]',
                            destinatarioTelefono: firstPart.telefono || '',
                            legajoFiscal: item.numeroLeg || '[LEGAJO]',
                            caratula: caratulaModStr,
                            tipoAudiencia: tiposStr,
                            fechaAudiencia: item.fechaAudiencia || '[FECHA]',
                            horaAudiencia: item.horaAudiencia || '[HORA]',
                            juez: item.juez || '[JUEZ]',
                            personasACitar: notif.parts.map(pKey => {
                                const pInfo = availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', dni: '' };
                                return {
                                    nombre: pInfo.nombre + (pInfo.rol ? ` (${pInfo.rol})` : ''),
                                    dni: pInfo.dni || '',
                                    telefono: pInfo.telefono || '',
                                    fecha: item.fechaAudiencia || '[FECHA]',
                                    hora: item.horaAudiencia || '[HORA]'
                                }
                            })
                        };

                        try {
                            // descargarPdfNotificacion modificado ahora devuelve { buffer, textoPlano }
                            const { buffer, textoPlano } = await descargarPdfNotificacion(notif.option, datosList, true);
                            
                            // Transformar ArrayBuffer a Base64
                            const bytes = new Uint8Array(buffer);
                            let binary = '';
                            for (let j = 0; j < bytes.byteLength; j++) {
                                binary += String.fromCharCode(bytes[j]);
                            }
                            const base64Str = btoa(binary);

                            documentosBase64.push({
                                nombreArchivo: `Notificacion_${notif.option}_${Date.now()}.pdf`,
                                base64: base64Str,
                                descripcion: `${item.numeroLeg} NOTIFICACION ${notif.option}`.toUpperCase(),
                                personasAnotificar: selectedPartsWithInfo.map(p => p.alias || p.nombre),
                                textoPlano: textoPlano || ""
                            });
                        } catch (e) {
                            console.error(`Error generando PDF para ${item.numeroLeg}`, e);
                        }
                    }
                }

                try {
                    // Llamar a la API
                    setSyncStatus(`Agendando ${i+1}/${aAgendar.length}: Conectando con PUMA...`);
                    const response = await fetch('/api/agendar-puppeteer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            solicitud: item,
                            documentosBase64: documentosBase64
                        })
                    });

                    if (!response.body) throw new Error("No readable stream");

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder("utf-8");
                    let bufferText = '';

                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        bufferText += decoder.decode(value, { stream: true });
                        const lines = bufferText.split('\n');
                        bufferText = lines.pop();

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const parsed = JSON.parse(line.substring(6));
                                    if (parsed.type === 'progress') {
                                        setSyncStatus(`Ag. ${i+1}/${aAgendar.length}: ${parsed.message}`);
                                    } else if (parsed.type === 'error') {
                                        // Marcar error (y tal vez guardar documentosSubidos si falló después de subirlos)
                                        console.error(`Error de agendamiento: ${parsed.error}`);
                                        if (parsed.documentosSubidos) {
                                            await addSolicitudData(item.rowKey, { ...item, agendadaError: parsed.error, documentosSubidos: true });
                                        } else {
                                            await addSolicitudData(item.rowKey, { ...item, agendadaError: parsed.error });
                                        }
                                        throw new Error(parsed.error);
                                    } else if (parsed.type === 'done') {
                                        setSyncStatus(`Ag. ${i+1}/${aAgendar.length}: Finalizado con éxito.`);
                                        await addSolicitudData(item.rowKey, { ...item, agendada: true, agendar: false, documentosSubidos: true, agendadaError: null, urlAgendamiento: parsed.data?.url });
                                        
                                        // AGREGAR LA AUDIENCIA A FIRESTORE
                                        if (addAudiencia) {
                                            const horaAudienciaStr = item.horaAudiencia || '';
                                            let horaInicioStr = '00:00';
                                            let minutosInicio = 0;
                                            let minutosFin = 30; // default 30 min
                                            
                                            if (horaAudienciaStr.includes('-')) {
                                                const parts = horaAudienciaStr.split('-');
                                                horaInicioStr = parts[0].trim();
                                                const h1 = horaInicioStr.split(':');
                                                const h2 = parts[1].trim().split(':');
                                                if (h1.length === 2 && h2.length === 2) {
                                                    minutosFin = (parseInt(h2[0])*60 + parseInt(h2[1])) - (parseInt(h1[0])*60 + parseInt(h1[1]));
                                                }
                                            } else if (horaAudienciaStr.includes('a')) {
                                                const parts = horaAudienciaStr.split('a');
                                                horaInicioStr = parts[0].trim();
                                                const h1 = horaInicioStr.split(':');
                                                const h2 = parts[1].trim().split(':');
                                                if (h1.length === 2 && h2.length === 2) {
                                                    minutosFin = (parseInt(h2[0])*60 + parseInt(h2[1])) - (parseInt(h1[0])*60 + parseInt(h1[1]));
                                                }
                                            } else {
                                                horaInicioStr = horaAudienciaStr.trim();
                                            }
                                            if (minutosFin <= 0) minutosFin = 30;
                                            
                                            // Extraer MPF/OJU-SJ-...
                                            const matchLegajo = (item.numeroLeg || '').match(/(MPF|OJU)-SJ-\d+-\d+/);
                                            const numeroLegLimpio = matchLegajo ? matchLegajo[0] : item.numeroLeg;
                                            
                                            const aId = `${horaInicioStr}-${numeroLegLimpio}`.replace(/\s+/g, '');
                                            
                                            // Buscar los imputados reales de partesLegajo
                                            const partsImputados = availablePartsList.filter(p => p.rol.toUpperCase().includes('IMPUTADO'));
                                            
                                            // Fallback al listado genérico de imputados de la fila si Partes está vacío
                                            const baseImp = item.imputados || [];
                                            const activeImputados = partsImputados.length > 0 ? partsImputados : baseImp;
                                            
                                            let situacionStr = activeImputados.map(p => {
                                                if (p.situacionCorporal) return `${p.situacionCorporal} ${p.situacionDetalle || ''}`.trim();
                                                return '';
                                            }).filter(Boolean).join(' / ');
                                            if (!situacionStr) situacionStr = 'No especificada';
                                            
                                            const isEjecucion = (item.tipos || []).some(t => {
                                                const norm = String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                                                return norm.includes('tramites de ejecucion') || norm.includes('tramites de eje');
                                            });

                                            let imputadosArray = activeImputados.map((p, idx) => ({
                                                nombre: p.alias || p.nombre,
                                                dni: p.dni || '',
                                                asistencia: "false",
                                                condenado: isEjecucion ? "true" : "false",
                                                detenido: p.situacionCorporal === 'Detenido' ? "true" : "false",
                                                id: `i${idx + 1}`,
                                                presencial: true
                                            }));
                                            
                                            const dataObj = {
                                                aId,
                                                hora: horaInicioStr,
                                                horaProgramada: minutosFin.toString(),
                                                sala: item.sala || '',
                                                numeroLeg: numeroLegLimpio,
                                                tipo: item.tipos && item.tipos[0] ? item.tipos[0] : '',
                                                tipo2: item.tipos && item.tipos[1] ? item.tipos[1] : '',
                                                tipo3: item.tipos && item.tipos[2] ? item.tipos[2] : '',
                                                juez: item.juez || '',
                                                estado: "PROGRAMADA",
                                                situacion: situacionStr,
                                                imputado: imputadosArray
                                            };
                                            
                                            // Format date DDMMAAAA
                                            let fDate = item.fechaAudiencia || ''; // expected DD/MM/YYYY
                                            fDate = fDate.replace(/\//g, '');
                                            // Llenado si fDate es distinto? asumo fDate va bien
                                            await addAudiencia(dataObj, fDate);
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parseando data SSE", e);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Fallo al procesar agendamiento", e);
                    setSyncStatus(`Error en ${item.numeroLeg}: ${e.message}`);
                    await new Promise(r => setTimeout(r, 4000));
                }
            }

            setSyncStatus(`✓ Proceso masivo finalizado.`);
        } catch (error) {
            console.error("Error global de agendamiento:", error);
            setSyncStatus(`Error: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    }

    const statusColor = syncStatus.startsWith('✓') ? '#4ade80'
        : syncStatus.startsWith('Error') || syncStatus.includes('Fallo') ? '#f87171'
            : '#6b7280'

    return (
        <div className={styles.solHeader}>
            <span className={styles.headerSection}>
                <button
                    className={styles.syncButton}
                    title="Sincronizar Solicitudes"
                    onClick={syncSolicitudesHandler}
                    disabled={isSyncing}
                >
                    <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>

                {/* Botón Agendar Masivo */}
                <button
                    className={styles.syncButton}
                    style={{ background: 'var(--green)', color: 'white', borderColor: 'var(--green)' }}
                    title="Agendar Solicitudes Marcadas"
                    onClick={agendarMasivoHandler}
                    disabled={isSyncing}
                >
                    <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-calendar'}`}></i>
                    {isSyncing ? 'Agendando...' : 'Agendar'}
                </button>

                {/* Status */}
                {syncStatus && (
                    <span style={{
                        fontSize: '12px',
                        color: statusColor,
                        background: 'rgba(128,128,128,0.08)',
                        border: '1px solid rgba(128,128,128,0.15)',
                        borderRadius: '5px',
                        padding: '2px 10px',
                        maxWidth: '340px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'monospace',
                    }}>
                        {syncStatus}
                    </span>
                )}
            </span>

            {/* Botón tema — empujado al extremo derecho */}
            <button
                className={styles.themeButton}
                onClick={toggleTheme}
                title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
                <span>{isLight ? '🌙' : '☀️'}</span>
                <span className={styles.themeLabel}>{isLight ? 'Oscuro' : 'Claro'}</span>
            </button>
        </div>
    )
}