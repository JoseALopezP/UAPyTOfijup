'use client'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext'
import styles from '../SolicitudesAudiencia.module.css'

const STORAGE_KEY = 'app-theme'

export default function HeaderSolicitudes() {
    const { solicitudesPendientes, addSolicitudData, addAudiencia, desplegables, archiveOldSolicitudes } = useContext(DataContext);
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

            const bodyData = { existingData, tiposAudiencia: desplegables?.tiposPuma || [] };

            if (typeof window !== 'undefined' && window.electronAPI) {
                window.electronAPI.removeAllListeners('extraer-solicitudes-progress');
                window.electronAPI.on('extraer-solicitudes-progress', (event, parsed) => {
                    if (parsed.type === 'progress') setSyncStatus(parsed.message);
                    else if (parsed.type === 'error') setSyncStatus(`Error: ${parsed.error}`);
                });

                const result = await window.electronAPI.invoke('extraer-solicitudes', bodyData);
                if (!result.success) throw new Error(result.error);

                const newItems = result.data || [];
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
            } else {
                const response = await fetch('/api/extraer-solicitudes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
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
            }

            // Archivar solicitudes viejas (> 1 semana) después de la sincronización
            setSyncStatus('Archivando solicitudes antiguas...');
            const archivedCount = await archiveOldSolicitudes(Array.isArray(solicitudesPendientes) ? solicitudesPendientes : []);
            if (archivedCount > 0) {
                setSyncStatus(`✓ Sincronizado. ${archivedCount} archivadas.`);
            } else {
                setSyncStatus(`✓ Sincronizado correctamente.`);
            }

        } catch (error) {
            console.error("Error de red:", error);
            setSyncStatus(`Error de red: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    }

    const revisarSolicitudesHandler = async () => {
        try {
            console.log("[ui] Iniciando revisión masiva (todas las solicitudes)...");
            setIsSyncing(true);
            setSyncStatus('Iniciando Revisión...');

            const bodyData = { existingData: [], tiposAudiencia: desplegables?.tiposPuma || [], forceReviewAll: true };

            if (typeof window !== 'undefined' && window.electronAPI) {
                window.electronAPI.removeAllListeners('extraer-solicitudes-progress');
                window.electronAPI.on('extraer-solicitudes-progress', (event, parsed) => {
                    if (parsed.type === 'progress') setSyncStatus(parsed.message);
                    else if (parsed.type === 'error') setSyncStatus(`Error: ${parsed.error}`);
                });

                const result = await window.electronAPI.invoke('extraer-solicitudes', bodyData);
                if (!result.success) throw new Error(result.error);

                const newItems = result.data || [];
                setSyncStatus(`Revisando y fusionando ${newItems.length} solicitudes...`);
                
                const existingDataArr = Array.isArray(solicitudesPendientes) ? solicitudesPendientes : [];
                
                // Marcar como noEncontrada = true a las que no están en newItems
                for (const oldItem of existingDataArr) {
                    const found = newItems.find(n => n.numeroLeg === oldItem.numeroLeg && n.fyhcreacion === oldItem.fyhcreacion);
                    if (!found) {
                        if (!oldItem.noEncontrada && !oldItem.agendada) { // Solo marcar si no estaba agendada
                            await addSolicitudData(oldItem.rowKey, { ...oldItem, noEncontrada: true });
                        }
                    } else if (oldItem.noEncontrada) {
                        await addSolicitudData(oldItem.rowKey, { ...oldItem, noEncontrada: false });
                    }
                }

                // Actualizar las existentes y agregar las nuevas
                for (const item of newItems) {
                    const rowKey = item.linkSol
                        ? item.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
                        : `${item.numeroLeg}_${item.fyhcreacion}`;
                    
                    const existing = existingDataArr.find(e => e.rowKey === rowKey);
                    
                    if (existing) {
                        let newPartesLegajo = [...(existing.partesLegajo || [])];
                        if (item.partesLegajo) {
                            newPartesLegajo = newPartesLegajo.filter(p => p.agregadaOriginalmente === false);
                            for (const np of item.partesLegajo) {
                                newPartesLegajo.push({...np, agregadaOriginalmente: true});
                            }
                        }
                        
                        await addSolicitudData(rowKey, {
                            ...existing,
                            intervinientes: item.intervinientes,
                            documentos: item.documentos,
                            partesLegajo: newPartesLegajo,
                            solicitante: item.solicitante,
                            jueces: item.jueces,
                            delitos: item.delitos,
                            noEncontrada: false
                        });
                    } else {
                        await addSolicitudData(rowKey, item);
                    }
                }

                // Archivar solicitudes viejas (> 1 semana)
                setSyncStatus('Archivando solicitudes antiguas...');
                const archivedCount = await archiveOldSolicitudes(existingDataArr);
                if (archivedCount > 0) {
                    setSyncStatus(`✓ Revisión completada. ${archivedCount} archivadas.`);
                } else {
                    setSyncStatus(`✓ Revisión completada.`);
                }

            } else {
                 setSyncStatus(`Error: Revisión solo disponible en app de escritorio.`);
            }
        } catch (error) {
            console.error("Error de revisión:", error);
            setSyncStatus(`Error: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    }

    const agendarMasivoHandler = async () => {
        try {
            console.log("[ui] Iniciando agendamiento masivo...");
            setIsSyncing(true);
            setSyncStatus('Iniciando Agendamiento...');

            const aAgendar = (solicitudesPendientes || []).filter(s => (s.agendar === true || s.reprogramar === true || s.cancelar === true) && !s.agendada);
            // Si es reprogramar o cancelar, permitimos que pase aunque ya esté agendada
            const aProcesar = (solicitudesPendientes || []).filter(s => 
                (s.agendar === true && !s.agendada) || 
                (s.reprogramar === true) || 
                (s.cancelar === true) ||
                (s.convertirJurisdiccional === true) ||
                (s.agendada && s.notificaciones && s.notificaciones.some(n => !n.notificada))
            );
            // Reconversiones: agendar=true y tiene tiposOriginales distintos de tipos actuales
            const aReconvertir = (solicitudesPendientes || []).filter(s =>
                (s.agendar === true || s.convertirJurisdiccional === true) &&
                s.tiposOriginales && JSON.stringify(s.tiposOriginales) !== JSON.stringify(s.tipos)
            );

            if (aProcesar.length === 0) {
                setSyncStatus('✓ No hay solicitudes para procesar.');
                setIsSyncing(false);
                return;
            }

            for (let i = 0; i < aProcesar.length; i++) {
                const item = aProcesar[i];
                try {
                    const action = item.convertirJurisdiccional ? 'Convirtiendo a Jurisdiccional' : (item.cancelar ? 'Cancelando' : (item.reprogramar ? 'Reprogramando' : (item.agendada ? 'Notificando' : 'Agendando')));
                    setSyncStatus(`${action} ${i+1}/${aProcesar.length}: ${item.numeroLeg}...`);
                    
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
                // Preparar PDFs de notificaciones si no se han subido ya
                let documentosBase64 = [];
                const TEMPLATES_NO_PDF = [
                    "AUDIENCIA  CITACION FISCAL DEFENSA",
                    "AUDIENCIA OFICIO POLICÍA TRASLADO DETENIDO",
                    "AUDIENCIA OFICIO POLICÍA TRASLADO PRISION DOMICILIARIA",
                    "CANCELACION AUDIENCIA FISCAL DEFENSA",
                    "CITACION IMPUTADO DETENIDO PARA AUDIENCIA",
                    "Citación IMPUTADO IMPUGNACIÓN CONEXIÓN",
                    "CONEXIÓN DE ZOOM IMPUTADOS PARA ANIVI",
                    "Ejecución CITACIÓN FISCAL DEFENSA",
                    "Ejecución CITACIÓN IMPUTADO ZOOM",
                    "MODELO",
                    "NOTIFICACIÓN ASESORÍAS PARA VIDEOGRABADA ANIVI",
                    "NOTIFICACION DE ANIVI PARA SAP"
                ];

                if (item.notificaciones && item.notificaciones.length > 0) {
                    const { descargarPdfNotificacion } = await import('@/utils/notificacionesAgendamiento');
                    
                    const pendientes = item.notificaciones.filter(n => !n.notificada);
                    for (const notif of pendientes) {
                        const selectedPartsWithInfo = notif.parts.map(pKey => availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', direccion: '', localidad: '', telefono: '', alias: '' });
                        const destinatariosStr = selectedPartsWithInfo.map(p => p.alias || p.nombre).join(', ');
                        
                        if (TEMPLATES_NO_PDF.includes(notif.option)) {
                            documentosBase64.push({
                                isTemplateOnly: true,
                                templateName: notif.option,
                                personasAnotificar: selectedPartsWithInfo.map(p => p.alias || p.nombre),
                                descripcion: notif.option,
                                fechaAudiencia: item.fechaAudiencia,
                                horaAudiencia: item.horaAudiencia,
                                localKey: notif.parts.join('|') + notif.option
                            });
                            continue;
                        }

                        if (item.documentosSubidos) continue;

                        const firstPart = selectedPartsWithInfo.find(p => p.direccion || p.localidad || p.telefono) || {};
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
                            horaFinAudiencia: item.horaFinAudiencia || '[HORA FIN]',
                            juez: item.juez || '[JUEZ]',
                            personasACitar: notif.parts.map(pKey => {
                                const pInfo = availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', dni: '' };
                                return {
                                    nombre: pInfo.nombre + (pInfo.rol ? ` (${pInfo.rol})` : ''),
                                    dni: pInfo.dni || '',
                                    telefono: pInfo.telefono || '',
                                    fecha: item.fechaAudiencia || '[FECHA]',
                                    hora: item.horaAudiencia || '[HORA]',
                                    horaFin: item.horaFinAudiencia || '[HORA FIN]'
                                }
                            })
                        };

                        try {
                            const { buffer, textoPlano } = await descargarPdfNotificacion(notif.option, datosList, true);
                            
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
                                textoPlano: textoPlano,
                                localKey: notif.parts.join('|') + notif.option
                            });
                        } catch (err) {
                            console.error("Error generando PDF para notificación:", err);
                        }
                    }
                }

                try {
                    setSyncStatus(`Agendando ${i+1}/${aProcesar.length}: Conectando con PUMA...`);
                    const bodyData = {
                        solicitud: item,
                        documentosBase64: documentosBase64,
                        action: item.convertirJurisdiccional ? 'convertir-jurisdiccional' : (item.cancelar ? 'cancelar' : (item.reprogramar ? 'reprogramar' : (item.agendada ? 'notificar-solo' : 'agendar'))),
                        convertirJurisdiccionalTipo: item.convertirJurisdiccionalTipo || '',
                        convertirJurisdiccionalMotivo: item.convertirJurisdiccionalMotivo || '',
                        reconversionMotivo: item.reconversionMotivo || ''
                    };

                    const procesarFinalizado = async (parsedData) => {
                        const actionDone = item.convertirJurisdiccional ? 'Convertido a Jurisdiccional' : (item.cancelar ? 'Cancelado' : (item.reprogramar ? 'Reprogramado' : 'Agendado'));
                        setSyncStatus(`${actionDone} ${i+1}/${aProcesar.length}: Finalizado con éxito.`);
                        
                        const nuevasNotifs = (item.notificaciones || []).map(n => {
                            const key = n.parts.join('|') + n.option;
                            if (documentosBase64.some(d => d.localKey === key)) {
                                return { ...n, notificada: true };
                            }
                            return n;
                        });

                        let finalFechaAudiencia = item.fechaAudiencia;
                        let finalHoraAudiencia = item.horaAudiencia;
                        
                        if (item.convertirJurisdiccional) {
                            const now = new Date();
                            finalFechaAudiencia = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                            finalHoraAudiencia = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        }

                        await addSolicitudData(item.rowKey, { 
                            ...item, 
                            agendada: item.cancelar ? false : true, 
                            fechaAudiencia: finalFechaAudiencia,
                            horaAudiencia: finalHoraAudiencia,
                            agendar: false, 
                            reprogramar: false, 
                            cancelar: false,
                            convertirJurisdiccional: false,
                            documentosSubidos: true, 
                            agendadaError: null, 
                            urlAgendamiento: parsedData?.url,
                            notificaciones: nuevasNotifs 
                        });
                        return { finalFechaAudiencia, finalHoraAudiencia };
                    };

                    const procesarError = async (parsedError) => {
                        console.error(`Error de agendamiento: ${parsedError}`);
                        if (parsedError.documentosSubidos || parsedError.includes('documentosSubidos: true')) {
                            await addSolicitudData(item.rowKey, { ...item, agendadaError: parsedError, documentosSubidos: true });
                        } else {
                            await addSolicitudData(item.rowKey, { ...item, agendadaError: parsedError });
                        }
                        throw new Error(parsedError);
                    };

                    let finalFechas = null;

                    if (typeof window !== 'undefined' && window.electronAPI) {
                        window.electronAPI.removeAllListeners('agendar-puppeteer-progress');
                        window.electronAPI.on('agendar-puppeteer-progress', (event, parsed) => {
                            if (parsed.type === 'progress') setSyncStatus(`Ag. ${i+1}/${aProcesar.length}: ${parsed.message}`);
                        });
                        
                        const result = await window.electronAPI.invoke('agendar-puppeteer', bodyData);
                        if (!result.success) await procesarError(result.error);
                        else finalFechas = await procesarFinalizado(result.resultado);
                    } else {
                        // Llamar a la API
                        const response = await fetch('/api/agendar-puppeteer', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(bodyData)
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
                                            setSyncStatus(`Ag. ${i+1}/${aProcesar.length}: ${parsed.message}`);
                                        } else if (parsed.type === 'error') {
                                            await procesarError(parsed.error);
                                        } else if (parsed.type === 'done') {
                                            finalFechas = await procesarFinalizado(parsed.data);
                                        }
                                    } catch (e) {
                                        console.error("Error parseando data SSE", e);
                                    }
                                }
                            }
                        }
                    }

                    // AGREGAR LA AUDIENCIA A FIRESTORE
                    if (finalFechas) {
                        const { finalFechaAudiencia, finalHoraAudiencia } = finalFechas;
                                            const horaAudienciaStr = finalHoraAudiencia || '';
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

                                            let defensaArray = [];
                                            let dIndex = 1;
                                            const addDefensores = (defs, tipoDef) => {
                                                if (!Array.isArray(defs)) return;
                                                for (const def of defs) {
                                                    let imps = [];
                                                    const defObj = typeof def === 'object' ? def : { nombre: def, representaA: [] };
                                                    
                                                    if (defObj.representaA && Array.isArray(defObj.representaA)) {
                                                        for (const repName of defObj.representaA) {
                                                            const matchImp = imputadosArray.find(i => 
                                                                i.nombre.toLowerCase().includes(repName.toLowerCase()) || 
                                                                repName.toLowerCase().includes(i.nombre.toLowerCase())
                                                            );
                                                            if (matchImp) {
                                                                imps.push({ id: matchImp.id, nombre: matchImp.nombre });
                                                            } else {
                                                                // Si no se encuentra un match exacto, usar id temporal
                                                                imps.push({ id: `i_desconocido`, nombre: repName });
                                                            }
                                                        }
                                                    }
                                                    
                                                    defensaArray.push({
                                                        id: `d${dIndex++}`,
                                                        nombre: defObj.nombre,
                                                        asistencia: "true",
                                                        presencial: true,
                                                        tipo: tipoDef, // 'particular' | 'oficial'
                                                        imputado: imps
                                                    });
                                                }
                                            };
                                            
                                            addDefensores(item.intervinientes?.defensor_particular, 'particular');
                                            addDefensores(item.intervinientes?.defensor_oficial, 'oficial');
                                            
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
                                                imputado: imputadosArray,
                                                defensa: defensaArray
                                            };
                                            
                                            // Format date DDMMAAAA
                                            let fDate = finalFechaAudiencia || ''; // expected DD/MM/YYYY
                                            fDate = fDate.replace(/\//g, '');
                                            // Llenado si fDate es distinto? asumo fDate va bien
                                            await addAudiencia(dataObj, fDate);
                                        }
                    } catch (e) {
                        console.error("Error en el stream de agendamiento:", e);
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
                    title="Sincronizar Solicitudes (Rápido)"
                    onClick={syncSolicitudesHandler}
                    disabled={isSyncing}
                >
                    <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                    className={styles.syncButton}
                    title="Revisar Todo (Lento, actualiza y busca borrados)"
                    onClick={revisarSolicitudesHandler}
                    disabled={isSyncing}
                >
                    <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
                    {isSyncing ? 'Revisando...' : 'Revisar'}
                </button>

                {/* Botón Procesar (ex-Agendar) */}
                {(() => {
                    const pendientes = Array.isArray(solicitudesPendientes) ? solicitudesPendientes : []
                    const countAgendar = pendientes.filter(s => s.agendar && !s.agendada).length
                    const countReconversiones = pendientes.filter(s => s.agendar && s.tiposOriginales && JSON.stringify(s.tiposOriginales) !== JSON.stringify(s.tipos)).length
                    const countConvertir = pendientes.filter(s => s.convertirJurisdiccional).length
                    const countBorrar = pendientes.filter(s => s.marcarBorrar).length
                    const countReprog = pendientes.filter(s => s.reprogramar).length
                    const countCancelar = pendientes.filter(s => s.cancelar).length
                    const totalProcesar = pendientes.filter(s =>
                        (s.agendar && !s.agendada) || s.reprogramar || s.cancelar || s.convertirJurisdiccional || s.marcarBorrar ||
                        (s.agendada && s.notificaciones && s.notificaciones.some(n => !n.notificada))
                    ).length

                    const tooltipLines = [
                        countAgendar > 0 ? `📅 Agendamientos: ${countAgendar}` : '',
                        countReconversiones > 0 ? `🔄 Reconversiones: ${countReconversiones}` : '',
                        countConvertir > 0 ? `⚖ Conv. Jurisdiccional: ${countConvertir}` : '',
                        countBorrar > 0 ? `🗑 Borrado: ${countBorrar}` : '',
                        countReprog > 0 ? `🔁 Reprogramaciones: ${countReprog}` : '',
                        countCancelar > 0 ? `🚫 Cancelaciones: ${countCancelar}` : '',
                    ].filter(Boolean).join('\n')

                    return (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                                className={styles.syncButton}
                                style={{ background: 'var(--green)', color: 'white', borderColor: 'var(--green)' }}
                                title={tooltipLines || 'Procesar Solicitudes Marcadas'}
                                onClick={agendarMasivoHandler}
                                disabled={isSyncing}
                            >
                                <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-cogs'}`}></i>
                                {isSyncing ? 'Procesando...' : 'Procesar'}
                            </button>
                            {totalProcesar > 0 && !isSyncing && (
                                <span style={{
                                    position: 'absolute', top: '-8px', right: '-8px',
                                    background: '#f59e0b', color: 'white',
                                    borderRadius: '50%', width: '20px', height: '20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 'bold',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'none'
                                }}>
                                    {totalProcesar}
                                </span>
                            )}
                        </div>
                    )
                })()}

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