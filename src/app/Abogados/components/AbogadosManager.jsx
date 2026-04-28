'use client'
import { useContext, useEffect, useState, useCallback } from 'react';
import { DataContext } from '@/context New/DataContext';
import styles from './Abogados.module.css';
import { LISTA_ABOGADOS_INICIAL } from './listaAbogadosData';

/**
 * m: nroMatricula
 * n: ayn (Apellido y Nombre)
 * t: tel
 * c: cargo
 * l: lugar
 */

const CARGOS = [
    { value: 'todos', label: 'Todos', color: '#868686' },
    { value: 'juez', label: 'Juez', color: '#5b9bd5' },
    { value: 'fiscal', label: 'Fiscal', color: '#d57b5b' },
    { value: 'aFiscal', label: 'Ayudante Fiscal', color: '#d5a05b' },
    { value: 'defensor', label: 'Defensor', color: '#5bd579' },
    { value: 'aDefensor', label: 'Ayudante Defensor', color: '#8a5bd5' },
    { value: 'otros', label: 'Otros / Sin Cargo', color: '#a0a0a0' },
];

const CARGO_COLORS = Object.fromEntries(CARGOS.map(c => [c.value, c.color]));

const CARGO_LABELS = {
    juez: 'Juez',
    fiscal: 'Fiscal',
    aFiscal: 'Ay. Fiscal',
    defensor: 'Defensor',
    aDefensor: 'Ay. Defensor',
    otros: 'Otros / Sin Cargo',
};

// Intenta mapear el cargo string original a uno de los keys permitidos
const mapCargo = (cargoStr) => {
    if (!cargoStr) return 'otros';
    const c = cargoStr.toLowerCase();
    if (c.includes('juez')) return 'juez';
    if (c.includes('ayudante fiscal')) return 'aFiscal';
    if (c.includes('fiscal')) return 'fiscal';
    if (c.includes('ayudante defensor')) return 'aDefensor';
    if (c.includes('defensor')) return 'defensor';
    return 'otros';
};

function CargoPill({ cargo }) {
    const key = mapCargo(cargo);
    const color = CARGO_COLORS[key] || '#868686';
    return (
        <span
            className={styles.cargoPill}
            style={{
                background: color + '18',
                color,
                border: `1px solid ${color}33`,
            }}
        >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {cargo || '—'}
        </span>
    );
}

function GeneroPill({ s }) {
    if (s === undefined) return <span style={{ color: '#666', fontSize: 11 }}>?</span>;
    return s ? (
        <span style={{ background: '#d55b9b18', color: '#d55b9b', padding: '2px 6px', borderRadius: 4, fontSize: 11, border: '1px solid #d55b9b33' }}>F</span>
    ) : (
        <span style={{ background: '#5b9bd518', color: '#5b9bd5', padding: '2px 6px', borderRadius: 4, fontSize: 11, border: '1px solid #5b9bd533' }}>M</span>
    );
}

function NuevoAbogadoRow({ onSave, onCancel }) {
    const [form, setForm] = useState({ n: '', m: '', t: '', c: 'fiscal', l: '', s: false });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <tr style={{ background: '#0d1620' }}>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="Matrícula"
                    value={form.m}
                    onChange={e => set('m', e.target.value)}
                />
            </td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="Apellido y Nombre"
                    value={form.n}
                    onChange={e => set('n', e.target.value)}
                />
            </td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="Teléfono"
                    value={form.t}
                    onChange={e => set('t', e.target.value)}
                />
            </td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="Cargo original / PJ"
                    value={form.c}
                    onChange={e => set('c', e.target.value)}
                />
            </td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="Lugar"
                    value={form.l}
                    onChange={e => set('l', e.target.value)}
                />
            </td>
            <td>
                <select className={styles.editInput} value={form.s ? 'true' : 'false'} onChange={e => set('s', e.target.value === 'true')}>
                    <option value="false">M</option>
                    <option value="true">F</option>
                </select>
            </td>
            <td>
                <div className={styles.rowActions}>
                    <button
                        className={styles.btnPrimary}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={() => {
                            if (!form.m.trim() || !form.n.trim()) return;
                            onSave(form);
                        }}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles.btnSecondary}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </td>
        </tr>
    );
}

function AbogadoRow({ abogado, isSelected, onSelect, onSave, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ ...abogado });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSave = () => {
        onSave(form);
        setEditing(false);
    };

    return (
        <tr
            className={isSelected ? styles.rowSelected : ''}
            onClick={() => !editing && onSelect(abogado.m)}
        >
            <td style={{ width: 100 }}>
                {editing
                    ? <input className={styles.editInput} value={form.m} onChange={e => set('m', e.target.value)} />
                    : <span style={{ color: '#666', fontSize: 12 }}>{abogado.m}</span>
                }
            </td>
            <td>
                {editing
                    ? <input className={styles.editInput} value={form.n} onChange={e => set('n', e.target.value)} style={{ width: '100%' }} />
                    : <span style={{ fontSize: 12.5 }}>{abogado.n}</span>
                }
            </td>
            <td style={{ width: 140 }}>
                {editing
                    ? <input className={styles.editInput} value={form.t} onChange={e => set('t', e.target.value)} />
                    : <span style={{ color: '#777', fontSize: 12 }}>{abogado.t || '—'}</span>
                }
            </td>
            <td style={{ width: 180 }}>
                {editing
                    ? <input className={styles.editInput} value={form.c} onChange={e => set('c', e.target.value)} />
                    : <CargoPill cargo={abogado.c} />
                }
            </td>
            <td style={{ width: 140 }}>
                {editing
                    ? <input className={styles.editInput} value={form.l || ''} onChange={e => set('l', e.target.value)} />
                    : <span style={{ fontSize: 12 }}>{abogado.l || '—'}</span>
                }
            </td>
            <td style={{ width: 60, textAlign: 'center' }}>
                {editing
                    ? <select className={styles.editInput} value={form.s ? 'true' : 'false'} onChange={e => set('s', e.target.value === 'true')} style={{ padding: '2px 4px' }}>
                        <option value="false">M</option>
                        <option value="true">F</option>
                    </select>
                    : <GeneroPill s={abogado.s} />
                }
            </td>
            <td style={{ width: 110 }}>
                <div className={styles.rowActions}>
                    {editing ? (
                        <>
                            <button className={styles.btnPrimary} style={{ padding: '4px 10px', fontSize: 11 }} onClick={handleSave}>✓</button>
                            <button className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setEditing(false)}>✕</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.iconBtn} onClick={e => { e.stopPropagation(); setEditing(true); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" /></svg>
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={e => { e.stopPropagation(); onDelete(abogado.m); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951ZM9.5 7.5a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5A.75.75 0 0 0 9.5 7.5Zm5 0a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5A.75.75 0 0 0 14.5 7.5Z" clipRule="evenodd" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

function ImportModal({ onConfirm, onCancel, loading }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Importar Lista (Modo Económico)</h2>
                <p className={styles.modalSubtitle}>Esta acción guardará los 5000+ registros en un documento único de 425KB para minimizar costos de Firebase.</p>
                <div className={styles.modalWarning}>⚠️ Se reemplazará cualquier lista existente.</div>
                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary} onClick={onCancel} disabled={loading}>Cancelar</button>
                    <button className={styles.btnImport} onClick={onConfirm} disabled={loading}>{loading ? 'Guardando...' : '⬆ Confirmar y Guardar'}</button>
                </div>
            </div>
        </div>
    );
}

export default function AbogadosManager() {
    const { abogados, updateAbogados, addAbogado, updateAbogadoData, deleteAbogado, importAbogados, updateDesplegables } = useContext(DataContext);

    const [selectedCargos, setSelectedCargos] = useState(['juez', 'fiscal', 'aFiscal', 'defensor', 'aDefensor', 'otros']);
    const [selectedLugares, setSelectedLugares] = useState([]);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'm', direction: 'asc' });
    const [selectedId, setSelectedId] = useState(null);

    const [showNuevo, setShowNuevo] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const { desplegables } = useContext(DataContext);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await updateAbogados();
            await updateDesplegables();
            setLoading(false);
        };
        load();
    }, []);

    const showToast = (msg, error = false) => {
        setToast({ msg, error });
        setTimeout(() => setToast(null), 3000);
    };

    const list = (abogados || []).filter(a => {
        const mappedCargo = mapCargo(a.c);
        const matchCargo = selectedCargos.includes(mappedCargo);
        const matchLugar = selectedLugares.length === 0 || selectedLugares.includes(a.l);
        const q = search.toLowerCase();
        const matchSearch = !q || a.n?.toLowerCase().includes(q) || a.m?.toString().includes(q);
        return matchCargo && matchLugar && matchSearch;
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';

        // Si es matrícula, intentar comparar numéricamente si es posible
        if (sortConfig.key === 'm') {
            const numA = parseInt(valA);
            const numB = parseInt(valB);
            if (!isNaN(numA) && !isNaN(numB)) {
                return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
            }
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };


    const toggleCargo = (val) => {
        setSelectedCargos(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const countByCargo = useCallback((cargoKey) => {
        return (abogados || []).filter(a => mapCargo(a.c) === cargoKey).length;
    }, [abogados]);

    const toggleLugar = (val) => {
        setSelectedLugares(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const countByLugar = useCallback((lugarKey) => {
        return (abogados || []).filter(a => a.l === lugarKey).length;
    }, [abogados]);

    const lugaresUnicos = Array.from(new Set((abogados || []).map(a => a.l).filter(Boolean))).sort();

    const handleAdd = async (form) => {
        await addAbogado(form);
        showToast('Abogado agregado.');
        setShowNuevo(false);
    };

    const handleUpdate = async (form) => {
        await updateAbogadoData(form);
        showToast('Actualizado correctamente.');
    };

    const handleDelete = async (m) => {
        if (!confirm('¿Eliminar registro?')) return;
        await deleteAbogado(m);
        showToast('Eliminado.');
    };

    const handleImport = async () => {
        setImportLoading(true);
        try {
            await importAbogados(LISTA_ABOGADOS_INICIAL);
            setShowImport(false);
            showToast('Importación exitosa.');
        } catch (e) {
            showToast('Error: ' + e.message, true);
        } finally {
            setImportLoading(false);
        }
    };

    const handleMigrateGenders = async () => {
        if (!confirm('¿Atrapar información de género desde las listas Legacy (Dra./Dr.) a la base nueva?')) return;
        setImportLoading(true);
        try {
            const legacyGroup = desplegables?.desplegables || {};
            const allLegacy = [
                ...(legacyGroup.jueces || []),
                ...(legacyGroup.fiscal || []),
                ...(legacyGroup.defensa || []),
                ...(legacyGroup.defensaParticular || [])
            ];

            const femaleNames = [];
            const maleNames = [];

            allLegacy.forEach(name => {
                const isFemale = /(Dra\.|Jueza|Sra\.)/i.test(name);
                const isMale = /(Dr\.|Sr\.)/i.test(name) && !isFemale;

                let cleanName = name.replace(/(^|\s)(Dr\.|Dra\.|Sr\.|Sra\.|El|La|Juez(?:a)?|Fiscal|Defensor(?:a)?)(\s|$)/gi, ' ');
                cleanName = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

                if (isFemale) femaleNames.push(cleanName);
                if (isMale) maleNames.push(cleanName);
            });

            const newAbogados = abogados.map(abg => {
                const nClean = abg.n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(',', '');

                const checkMatch = (legacyList) => {
                    return legacyList.some(legacyStr => {
                        const words = legacyStr.split(' ').filter(w => w.length > 2);
                        if (words.length === 0) return false;
                        return words.every(w => nClean.includes(w));
                    });
                };

                // Asignar prop s: verdadera(mujer), falsa(hombre)
                if (checkMatch(femaleNames)) {
                    return { ...abg, s: true };
                } else if (checkMatch(maleNames)) {
                    return { ...abg, s: false };
                }
                return abg; // Si no lo encuentra no toca
            });

            await importAbogados(newAbogados);
            showToast('Géneros mapeados correctamente desde Legacy.');
        } catch (e) {
            console.error(e);
            showToast('Error al migrar géneros.', true);
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <p className={styles.sidebarTitle}>Filtros de Cargo</p>
                    <div className={styles.cargoFilters}>
                        {CARGOS.filter(c => c.value !== 'todos').map(c => (
                            <label key={c.value} className={`${styles.cargoLabel} ${selectedCargos.includes(c.value) ? styles.cargoLabelActive : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedCargos.includes(c.value)}
                                    onChange={() => toggleCargo(c.value)}
                                    style={{ display: 'none' }}
                                />
                                <div className={styles.checkboxCustom} style={{ borderColor: c.color }}>
                                    {selectedCargos.includes(c.value) && <div style={{ background: c.color, width: 8, height: 8, borderRadius: 1 }} />}
                                </div>
                                <span className={styles.cargoText}>{c.label}</span>
                                <span className={styles.cargoBadge}>{countByCargo(c.value)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.sidebarHeader} style={{ marginTop: 20 }}>
                    <p className={styles.sidebarTitle}>Filtros de Lugar</p>
                    <div className={styles.cargoFilters}>
                        {lugaresUnicos.map(l => (
                            <label key={l} className={`${styles.cargoLabel} ${selectedLugares.includes(l) ? styles.cargoLabelActive : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedLugares.includes(l)}
                                    onChange={() => toggleLugar(l)}
                                    style={{ display: 'none' }}
                                />
                                <div className={styles.checkboxCustom} style={{ borderColor: '#868686' }}>
                                    {selectedLugares.includes(l) && <div style={{ background: '#868686', width: 8, height: 8, borderRadius: 1 }} />}
                                </div>
                                <span className={styles.cargoText}>{l}</span>
                                <span className={styles.cargoBadge}>{countByLugar(l)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <input className={styles.searchInput} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className={styles.abogadosList}>
                    {list.map(a => (
                        <div key={a.m} className={`${styles.abogadoItem} ${selectedId === a.m ? styles.abogadoItemActive : ''}`} onClick={() => setSelectedId(a.m)}>
                            <p className={styles.abogadoItemName}>{a.n}</p>
                            <p className={styles.abogadoItemSub}>#{a.m} · {a.c || 'PJ'}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.main}>
                <div className={styles.toolbar}>
                    <span className={styles.toolbarTitle}>Gestión de Abogados <span className={styles.toolbarSubtitle}>{list.length} registros</span></span>
                    <button className={styles.btnSecondary} onClick={handleMigrateGenders} disabled={importLoading}>🔌 Migrar Géneros</button>
                    <button className={styles.btnImport} onClick={() => setShowImport(true)}>⬆ Importar Datos</button>
                    <button className={styles.btnPrimary} onClick={() => setShowNuevo(true)}>+ Nuevo</button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('m')} className={styles.sortableHeader}>
                                    Matrícula <span className={styles.sortIcon}>{getSortIcon('m')}</span>
                                </th>
                                <th onClick={() => requestSort('n')} className={styles.sortableHeader}>
                                    Nombre <span className={styles.sortIcon}>{getSortIcon('n')}</span>
                                </th>
                                <th onClick={() => requestSort('t')} className={styles.sortableHeader}>
                                    Teléfono <span className={styles.sortIcon}>{getSortIcon('t')}</span>
                                </th>
                                <th onClick={() => requestSort('c')} className={styles.sortableHeader}>
                                    Cargo PJ <span className={styles.sortIcon}>{getSortIcon('c')}</span>
                                </th>
                                <th onClick={() => requestSort('l')} className={styles.sortableHeader}>
                                    Lugar <span className={styles.sortIcon}>{getSortIcon('l')}</span>
                                </th>
                                <th style={{ textAlign: 'center' }}>Género</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {showNuevo && <NuevoAbogadoRow onSave={handleAdd} onCancel={() => setShowNuevo(false)} />}
                            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#444' }}>Cargando...</td></tr> :
                                list.map(a => <AbogadoRow key={a.m} abogado={a} isSelected={selectedId === a.m} onSelect={setSelectedId} onSave={handleUpdate} onDelete={handleDelete} />)}
                        </tbody>
                    </table>
                </div>
            </div>
            {showImport && <ImportModal onConfirm={handleImport} onCancel={() => setShowImport(false)} loading={importLoading} />}
            {toast && <div className={`${styles.toast} ${toast.error ? styles.toastError : ''}`}>{toast.msg}</div>}
        </div>
    );
}
