'use client'
import { useState } from 'react'

// ── Datos estáticos ───────────────────────────────────────────────────────────
const PERSONAS = [
    { value: "5cdb154a-1c9b-43b4-af97-ac5f7a5340fd", label: "ADARVEZ, MARIO GUILLERMO" },
    { value: "fc156f9b-79b9-4ee7-ba43-97e2cde6dc74", label: "AGUILERA, VICTORIA BELEN" },
    { value: "1fd6624f-a79f-4f13-8d05-8094fac03cfc", label: "ALLENDE, FLAVIA GABRIELA" },
    { value: "c954ce5c-d7c5-469a-a3d8-6e825d827663", label: "BARBERA, EUGENIO MAXIMILIANO" },
    { value: "a308cb1b-af9a-469b-9647-613349e8e922", label: "BLEJMAN, MAXIMILIANO" },
    { value: "b539ee47-50bc-4d2d-a24e-dfb897240521", label: "BUENO, JUAN BAUTISTA" },
    { value: "0619f034-90af-4338-8780-6c9366cfc7a6", label: "CABALLERO, RAMÓN ALBERTO" },
    { value: "b00516a2-a6c5-4caf-801d-db8221c727e2", label: "CABALLERO VIDAL, JUAN CARLOS" },
    { value: "bf999ab3-09c0-4e42-98a5-35b6045cc1cd", label: "CARRERA PEDROTTI, MARIANO DANIEL" },
    { value: "7d990c48-df92-45b5-baf7-580f04642e8a", label: "CASTRO, DOMINGO DANIEL" },
    { value: "cfa416db-051b-455f-b9eb-a3aebf74385a", label: "CHICON, GLORIA VERÓNICA" },
    { value: "7423c846-66f0-417a-91f3-f58a8be49522", label: "CORREA PATIÑO, BENEDICTO WALTER" },
    { value: "b4acc711-e888-4477-a6a5-35cbe91f94af", label: "DAVILA SAFFE, MIGUEL ANGEL" },
    { value: "72867559-2439-436a-b734-8e3e76619fd6", label: "DE SANCTIS, GUILLERMO HORACIO" },
    { value: "f9f7c796-9713-44ef-982b-6e10292a03fc", label: "ECHEGARAY (JUEZ), FERNANDO RAMON" },
    { value: "eb77649b-1807-43a6-a17c-df73a249722d", label: "FERNANDEZ CAUSSI, GERARDO JAVIER" },
    { value: "0f4b01b7-081b-4da1-88d3-1c80b8b32a31", label: "FIGUEROLA, RODOLFO JAVIER" },
    { value: "2214d201-361e-453a-b4f4-ac96235d7a3f", label: "GARCIA NIETO, ADRIANA VERONICA" },
    { value: "608b0486-cdad-4d43-bc6a-13857eb044b9", label: "GROSSI, RICARDO ANIBAL" },
    { value: "583bfbe1-62aa-4b27-9fb5-fc46b834b547", label: "GUERRERO, MARIA GEMA" },
    { value: "c2baae9d-1dbe-43a8-84d2-dddf40e65aa1", label: "GUILLEN ALONSO, FABIO DANIEL" },
    { value: "9fb51a3f-e0cc-4680-aabb-309f7c783979", label: "HEREDIA ZALDO, MARTIN" },
    { value: "18e75f33-409c-4dc3-a076-26b0355ebb1c", label: "LAGE, MIGUEL ALEJANDRO" },
    { value: "ebf1ae29-1e6e-40bd-af5e-cd04c8223c2f", label: "LARREA, ANA LIA" },
    { value: "e0c00598-3153-4d7e-a03b-7be70db9961e", label: "LEON, PABLO LEONARDO" },
    { value: "82ee863e-a749-4a08-b9f8-6f67eafb5e08", label: "LIMA, CARLOS ALBERTO" },
    { value: "e08e0dd0-debd-47a5-9309-1b26965cbf38", label: "LIMA, MARCELO JORGE" },
    { value: "7ae6a2ce-8a69-4dd0-adb8-e73d125dfc93", label: "LOPEZ MARTI, SERGIO" },
    { value: "74bc10f5-181d-4dd1-95f1-fb529ecd910c", label: "LUCERO, MONICA" },
    { value: "f1415c0e-df2f-4ec5-bd1a-9b0b057ff41f", label: "MALDONADO DE ALVAREZ, CELIA" },
    { value: "3c046e92-78de-460e-b388-c0170776264c", label: "MEGLIOLI, JUAN GABRIEL" },
    { value: "8898fd62-4025-4998-901d-9833033433f1", label: "MOINE, RICARDO ESTEBAN" },
    { value: "1bafe788-09e2-4400-aa0c-8203d9639488", label: "MONTILLA, ROBERTO JORGE" },
    { value: "b6d3a23c-6c2d-4211-bcd7-f02ed6153c44", label: "MOYA, MABEL IRENE" },
    { value: "6f2fda4d-1870-4e9c-a19b-d9bffd584584", label: "MUÑOZ CARPINO, VICTOR HUGO" },
    { value: "e1a558d7-8e00-4b83-8bcc-884902b601cf", label: "OLIVARES YAPUR, DANIEL GUSTAVO" },
    { value: "dff5efdb-bbef-4ec7-b9fa-ca0e822f2cf2", label: "PALACIO, FEDERICO RAMON" },
    { value: "48c86072-79f4-4a01-88b1-e9ed025e740a", label: "PARRA, ANA CAROLINA" },
    { value: "e42da519-f5c9-42f5-881d-8f5220686624", label: "PARRON, MATIAS FRANCISCO" },
    { value: "ec778f44-3c12-467b-a04d-367eb554f256", label: "PEÑAFORT, MARTIN ENRIQUE" },
    { value: "e82ed61c-7ed2-42eb-a05f-3fc312fa198a", label: "QUIROGA, HUGO MARCOS" },
    { value: "0ab796b3-7537-47c0-b1f4-5a138491df53", label: "RAED, EDUARDO OSCAR" },
    { value: "60bf271c-f8bb-43ae-8d77-e8eb7ad1c728", label: "REVERENDO, LIDIA" },
    { value: "93be1c4a-b772-4fde-ad3b-fb696233f967", label: "ROCA, RENATO DARIO" },
    { value: "e8a07e1e-cbcf-474a-9d25-d40fe5b55d40", label: "RODRIGUEZ, FEDERICO MARCELO" },
    { value: "8a4ebd8d-d52e-48ac-a61a-94d07d663dc5", label: "ROSSO, MARIA SILVINA" },
    { value: "a47033bd-65dc-4da8-8207-6b9b7665e432", label: "SANZ, DIEGO MANUEL" },
    { value: "cf3b3c43-bc01-4487-b9f5-0f1cf0bdedd0", label: "VEGA, EDUARDO JESUS" },
    { value: "f4809669-8b17-48a3-8b78-868839d18ddf", label: "VICTORIA, JUAN JOSE ENRIQUE" },
    { value: "2b429315-56ed-460f-8187-97f60a7a5960", label: "ZAPATA, FEDERICO EMILIANO" },
]

const MOTIVOS = [
    { value: "d44576a8-a802-4b6d-86ef-374219150e3e", label: "ANIVI" },
    { value: "4c5299f0-b65a-4192-b652-aff42f40a908", label: "JUICIO" },
    { value: "3114ef2d-6986-4e7e-8c04-d65b9905f6db", label: "LICENCIA" },
    { value: "5dd721a8-f429-4879-8aaa-679ad9b89d1c", label: "OTRO" },
]

const BLOQUE_REGEX = /^\d{2}\/\d{2}\/\d{4} \| \d{2}:\d{2} - \d{2}:\d{2}$/

// ── Componente ────────────────────────────────────────────────────────────────
export default function BloqueoMasivo() {
    // Config global
    const [idPersona, setIdPersona] = useState('')
    const [idMotivo, setIdMotivo] = useState('')
    const [observaciones, setObservaciones] = useState('')

    // Lista de bloques
    const [bloques, setBloques] = useState([])
    const [nuevo, setNuevo] = useState('')
    const [nuevoError, setNuevoError] = useState('')
    const [editIdx, setEditIdx] = useState(null)
    const [editVal, setEditVal] = useState('')
    const [editError, setEditError] = useState('')

    // Estado del proceso
    const [estado, setEstado] = useState(null) // null | 'loading' | 'ok' | 'error'
    const [progreso, setProgreso] = useState({ index: 0, total: 0, exitosos: 0, erroresCount: 0 })
    const [erroresList, setErroresList] = useState([]) // [{ bloque, motivo }]
    const [mensajeFinal, setMensajeFinal] = useState('')

    // ── Agregar bloque ──────────────────────────────────────────────────────
    const handleAgregar = () => {
        const val = nuevo.trim()
        if (!BLOQUE_REGEX.test(val)) {
            setNuevoError('Formato inválido. Usá: DD/MM/AAAA | HH:MM - HH:MM')
            return
        }
        if (bloques.includes(val)) {
            setNuevoError('Ese bloque ya está en la lista.')
            return
        }
        setBloques(prev => [...prev, val])
        setNuevo('')
        setNuevoError('')
    }

    const handleEliminar = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx))
        if (editIdx === idx) { setEditIdx(null); setEditVal('') }
    }

    const handleGuardarEdit = (idx) => {
        const val = editVal.trim()
        if (!BLOQUE_REGEX.test(val)) {
            setEditError('Formato inválido. Usá: DD/MM/AAAA | HH:MM - HH:MM')
            return
        }
        setBloques(prev => prev.map((b, i) => i === idx ? val : b))
        setEditIdx(null); setEditVal(''); setEditError('')
    }

    // ── Lanzar (con streaming SSE) ──────────────────────────────────────────
    const handleLanzar = async () => {
        if (!idPersona || !idMotivo) {
            setMensajeFinal('⚠️ Seleccioná Persona y Motivo antes de continuar.')
            setEstado('error')
            return
        }
        if (bloques.length === 0) {
            setMensajeFinal('⚠️ Agregá al menos un bloque horario.')
            setEstado('error')
            return
        }

        setEstado('loading')
        setErroresList([])
        setMensajeFinal('')
        setProgreso({ index: 0, total: bloques.length, exitosos: 0, erroresCount: 0 })

        try {
            const response = await fetch('/api/bloqueo-auto/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fixed: { tipoPersona: 'juez', idPersona, idMotivo, observaciones },
                    bloques,
                }),
            })

            if (!response.ok || !response.body) {
                throw new Error(`Error del servidor: ${response.status}`)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() // la última línea puede estar incompleta

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    try {
                        const event = JSON.parse(line.slice(6))

                        if (event.type === 'progress') {
                            setProgreso({
                                index: event.index,
                                total: event.total,
                                exitosos: event.exitosos,
                                erroresCount: event.erroresCount,
                            })
                        } else if (event.type === 'block_error') {
                            setErroresList(prev => [...prev, { bloque: event.bloque, motivo: event.motivo }])
                        } else if (event.type === 'done') {
                            setEstado('ok')
                            setMensajeFinal(
                                `✅ Proceso terminado. ${event.exitosos} bloques exitosos` +
                                (event.errores.length > 0
                                    ? `, ${event.errores.length} con error (ver detalle abajo).`
                                    : ', sin errores.')
                            )
                        } else if (event.type === 'fatal') {
                            setEstado('error')
                            setMensajeFinal(`❌ Error fatal: ${event.message}`)
                        }
                    } catch { /* línea malformada, ignorar */ }
                }
            }

            // Si el stream terminó sin evento 'done' (ej: caída abrupta)
            if (estado === 'loading') {
                setEstado('error')
                setMensajeFinal('⚠️ El stream terminó inesperadamente.')
            }

        } catch (err) {
            setEstado('error')
            setMensajeFinal(`❌ Error al conectar: ${err.message}`)
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const pct = progreso.total > 0 ? Math.round((progreso.index / progreso.total) * 100) : 0

    return (
        <div style={s.card}>
            <h2 style={s.title}>🔒 Bloqueo Masivo</h2>

            {/* ── Config global ─────────────────────────────────────────── */}
            <div style={s.section}>
                <label style={s.label}>Persona</label>
                <select id="bm-persona" value={idPersona} onChange={e => setIdPersona(e.target.value)} style={s.select}>
                    <option value="">— Seleccioná una persona —</option>
                    {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            <div style={s.section}>
                <label style={s.label}>Motivo de bloqueo</label>
                <select id="bm-motivo" value={idMotivo} onChange={e => setIdMotivo(e.target.value)} style={s.select}>
                    <option value="">— Seleccioná un motivo —</option>
                    {MOTIVOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            <div style={s.section}>
                <label style={s.label}>Observaciones</label>
                <input
                    id="bm-observaciones"
                    type="text"
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    placeholder="Ej: Posgrado Parra"
                    style={s.input}
                />
            </div>

            {/* ── Agregar bloque ────────────────────────────────────────── */}
            <div style={s.section}>
                <label style={s.label}>
                    Bloques horarios
                    <span style={s.hint}> (DD/MM/AAAA | HH:MM - HH:MM)</span>
                </label>
                <div style={s.addRow}>
                    <input
                        id="bm-nuevo-bloque"
                        type="text"
                        value={nuevo}
                        onChange={e => { setNuevo(e.target.value); setNuevoError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                        placeholder="09/03/2026 | 15:00 - 18:00"
                        style={{ ...s.input, flex: 1 }}
                    />
                    <button id="bm-agregar-btn" onClick={handleAgregar} style={s.btnAdd}>
                        + Agregar
                    </button>
                </div>
                {nuevoError && <span style={s.errorTxt}>{nuevoError}</span>}
            </div>

            {/* ── Lista de bloques ──────────────────────────────────────── */}
            {bloques.length > 0 && (
                <div style={s.listaWrap}>
                    <div style={s.listaHeader}>
                        <span style={s.listaCount}>{bloques.length} bloque{bloques.length !== 1 ? 's' : ''}</span>
                        <button id="bm-limpiar-btn" onClick={() => setBloques([])} style={s.btnClear}>
                            Limpiar todo
                        </button>
                    </div>
                    <ul style={s.lista}>
                        {bloques.map((b, idx) => (
                            <li key={idx} style={s.listaItem}>
                                {editIdx === idx ? (
                                    <div style={{ flex: 1 }}>
                                        <div style={s.addRow}>
                                            <input
                                                type="text"
                                                value={editVal}
                                                onChange={e => { setEditVal(e.target.value); setEditError('') }}
                                                onKeyDown={e => e.key === 'Enter' && handleGuardarEdit(idx)}
                                                style={{ ...s.input, flex: 1, fontSize: '13px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => handleGuardarEdit(idx)} style={s.btnSave}>✓</button>
                                            <button onClick={() => { setEditIdx(null); setEditVal(''); setEditError('') }} style={s.btnCancel}>✕</button>
                                        </div>
                                        {editError && <span style={s.errorTxt}>{editError}</span>}
                                    </div>
                                ) : (
                                    <>
                                        <span style={s.bloqueTexto}>{b}</span>
                                        <div style={s.itemActions}>
                                            <button onClick={() => { setEditIdx(idx); setEditVal(b); setEditError('') }} style={s.btnEdit} title="Editar">✏️</button>
                                            <button onClick={() => handleEliminar(idx)} style={s.btnDelete} title="Eliminar">🗑️</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Botón lanzar ─────────────────────────────────────────── */}
            <button
                id="bm-lanzar-btn"
                onClick={handleLanzar}
                disabled={estado === 'loading'}
                style={{ ...s.btnLanzar, ...(estado === 'loading' ? s.btnLanzarDisabled : {}) }}
            >
                {estado === 'loading'
                    ? `⏳ Procesando ${progreso.index}/${progreso.total}...`
                    : `🚀 Lanzar bloqueo masivo (${bloques.length} bloques)`}
            </button>

            {/* ── Barra de progreso ─────────────────────────────────────── */}
            {estado === 'loading' && (
                <div style={s.progressWrap}>
                    <div style={{ ...s.progressBar, width: `${pct}%` }} />
                    <div style={s.progressStats}>
                        <span style={{ color: '#86efac' }}>✓ {progreso.exitosos} ok</span>
                        {progreso.erroresCount > 0 && (
                            <span style={{ color: '#fca5a5' }}>✗ {progreso.erroresCount} error{progreso.erroresCount !== 1 ? 'es' : ''}</span>
                        )}
                        <span style={{ color: '#9D9D9D' }}>{pct}%</span>
                    </div>
                </div>
            )}

            {/* ── Mensaje final ─────────────────────────────────────────── */}
            {mensajeFinal && (
                <div style={{
                    ...s.mensajeBox,
                    background: estado === 'ok'
                        ? (erroresList.length > 0 ? '#1a1500' : '#0d2e1a')
                        : '#2e0d0d',
                    borderColor: estado === 'ok'
                        ? (erroresList.length > 0 ? '#ca8a04' : '#22c55e')
                        : '#ef4444',
                    color: estado === 'ok'
                        ? (erroresList.length > 0 ? '#fde68a' : '#86efac')
                        : '#fca5a5',
                }}>
                    {mensajeFinal}
                </div>
            )}

            {/* ── Lista de errores ──────────────────────────────────────── */}
            {erroresList.length > 0 && (
                <div style={s.erroresWrap}>
                    <div style={s.erroresHeader}>
                        <span style={{ color: '#fca5a5', fontWeight: 700 }}>
                            ⚠️ {erroresList.length} bloque{erroresList.length !== 1 ? 's' : ''} con error
                        </span>
                    </div>
                    <ul style={s.erroresList}>
                        {erroresList.map((e, i) => (
                            <li key={i} style={s.errorItem}>
                                <div style={s.errorBloque}>📅 {e.bloque}</div>
                                <div style={s.errorMotivo}>{e.motivo}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
    card: {
        width: '100%',
        border: '1px solid #2B2B2B',
        borderRadius: '8px',
        padding: '20px 24px',
        background: '#111111',
        color: '#CCCCCC',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    title: {
        color: '#FFFFFF',
        fontSize: '22px',
        fontWeight: 600,
        marginBottom: '20px',
        marginTop: 0,
    },
    section: {
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#9D9D9D',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    hint: {
        fontWeight: 400,
        textTransform: 'none',
        color: '#555',
        fontSize: '12px',
    },
    select: {
        background: '#1c1c1c',
        color: '#FFFFFF',
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        height: '36px',
        padding: '0 10px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
    },
    input: {
        background: '#1c1c1c',
        color: '#FFFFFF',
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        height: '36px',
        padding: '0 10px',
        fontSize: '14px',
        outline: 'none',
    },
    addRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
    },
    btnAdd: {
        background: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '0 16px',
        height: '36px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        whiteSpace: 'nowrap',
    },
    errorTxt: {
        color: '#f87171',
        fontSize: '12px',
    },
    listaWrap: {
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        marginBottom: '16px',
        overflow: 'hidden',
    },
    listaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: '#1a1a1a',
        borderBottom: '1px solid #2B2B2B',
    },
    listaCount: {
        fontSize: '13px',
        color: '#9D9D9D',
        fontWeight: 600,
    },
    btnClear: {
        background: 'transparent',
        color: '#f87171',
        border: '1px solid #7f1d1d',
        borderRadius: '4px',
        padding: '2px 10px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    lista: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: '240px',
        overflowY: 'auto',
    },
    listaItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        borderBottom: '1px solid #1e1e1e',
        gap: '8px',
    },
    bloqueTexto: {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e2e8f0',
        flex: 1,
    },
    itemActions: { display: 'flex', gap: '4px' },
    btnEdit: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 4px',
        borderRadius: '4px',
    },
    btnDelete: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 4px',
        borderRadius: '4px',
    },
    btnSave: {
        background: '#166534',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px',
    },
    btnCancel: {
        background: '#7f1d1d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px',
    },
    btnLanzar: {
        width: '100%',
        height: '44px',
        background: '#7c3aed',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.02em',
    },
    btnLanzarDisabled: {
        background: '#3b1f6e',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    progressWrap: {
        marginTop: '10px',
        background: '#1c1c1c',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #2B2B2B',
    },
    progressBar: {
        height: '6px',
        background: 'linear-gradient(90deg, #7c3aed, #22c55e)',
        transition: 'width 0.4s ease',
    },
    progressStats: {
        display: 'flex',
        gap: '16px',
        padding: '6px 12px',
        fontSize: '13px',
    },
    mensajeBox: {
        marginTop: '12px',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'monospace',
        border: '1px solid',
    },
    erroresWrap: {
        marginTop: '12px',
        border: '1px solid #7f1d1d',
        borderRadius: '6px',
        overflow: 'hidden',
        background: '#150505',
    },
    erroresHeader: {
        padding: '8px 12px',
        background: '#1a0000',
        borderBottom: '1px solid #7f1d1d',
        fontSize: '13px',
    },
    erroresList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: '240px',
        overflowY: 'auto',
    },
    errorItem: {
        padding: '8px 12px',
        borderBottom: '1px solid #2a0000',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    errorBloque: {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#fcd34d',
        fontWeight: 600,
    },
    errorMotivo: {
        fontSize: '12px',
        color: '#fca5a5',
        fontStyle: 'italic',
    },
}
