'use client'
import { useState, useEffect } from 'react';
import { useAuthContext, AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import getDocument from "@/firebase/firestore/getDocument";
import firebase_app from "@/firebase/config";
import { getFirestore, doc, updateDoc, deleteField } from "firebase/firestore";
import styles from './GestionUsuarios.module.css';

function UserRow({ userItem, onSave, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        userId: userItem.userId || '',
        email: userItem.email || '',
        type: userItem.type || ''
    });

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSave = async () => {
        if (!form.userId.trim()) {
            alert("El ID del usuario es obligatorio.");
            return;
        }
        await onSave(userItem, form);
        setEditing(false);
    };

    return (
        <tr>
            <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
                {userItem.path.join(" > ")}
            </td>
            <td>
                {editing ? (
                    <input
                        className={styles.editInput}
                        value={form.userId}
                        onChange={(e) => set('userId', e.target.value)}
                        placeholder="UID de Firebase"
                    />
                ) : (
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{userItem.userId}</span>
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        className={styles.editInput}
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                    />
                ) : (
                    <span style={{ fontWeight: '500', color: '#ffffff' }}>
                        {userItem.email || <span style={{ color: '#555', fontStyle: 'italic' }}>Sin email</span>}
                    </span>
                )}
            </td>
            <td>
                {editing ? (
                    <select
                        value={form.type}
                        onChange={(e) => set('type', e.target.value)}
                        className={styles.roleSelect}
                    >
                        <option value="admin">Admin</option>
                        <option value="ual">UAL</option>
                        <option value="uac">UAC</option>
                        <option value="unc">UNC</option>
                        <option value="ugaadmin">UGA Admin</option>
                        <option value="uga">UGA</option>
                        <option value="operador">Operador</option>
                        <option value="uapyt">UAPyT</option>
                    </select>
                ) : (
                    <span style={{ textTransform: 'uppercase', fontSize: '12px', color: '#888' }}>
                        {userItem.type || '—'}
                    </span>
                )}
            </td>
            <td>
                <div className={styles.rowActions}>
                    {editing ? (
                        <>
                            <button className={styles.btnAction} onClick={handleSave}>✓ Guardar</button>
                            <button className={styles.btnSecondary} onClick={() => { setForm({ userId: userItem.userId, email: userItem.email, type: userItem.type }); setEditing(false); }}>✕</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.iconBtn} onClick={() => setEditing(true)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                </svg>
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(userItem)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951ZM9.5 7.5a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5A.75.75 0 0 0 9.5 7.5Zm5 0a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5A.75.75 0 0 0 14.5 7.5Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

function NuevoUserRow({ onSave, onCancel }) {
    const [form, setForm] = useState({ userId: '', email: '', type: 'operador' });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <tr style={{ background: '#0d1620' }}>
            <td style={{ fontStyle: 'italic', color: '#888' }}>Nuevo Registro</td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="UID de Firebase"
                    value={form.userId}
                    onChange={e => set('userId', e.target.value)}
                />
            </td>
            <td>
                <input
                    className={styles.editInput}
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                />
            </td>
            <td>
                <select
                    className={styles.roleSelect}
                    value={form.type}
                    onChange={e => set('type', e.target.value)}
                >
                    <option value="admin">Admin</option>
                    <option value="ual">UAL</option>
                    <option value="uac">UAC</option>
                    <option value="unc">UNC</option>
                    <option value="ugaadmin">UGA Admin</option>
                    <option value="uga">UGA</option>
                    <option value="operador">Operador</option>
                    <option value="uapyt">UAPyT</option>
                </select>
            </td>
            <td>
                <div className={styles.rowActions}>
                    <button
                        className={styles.btnAction}
                        onClick={() => {
                            if (!form.userId.trim()) {
                                alert("El UID es obligatorio.");
                                return;
                            }
                            onSave(form);
                        }}
                    >
                        Guardar
                    </button>
                    <button className={styles.btnSecondary} onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </td>
        </tr>
    );
}

function GestionUsuariosContent() {
    const { user, userRole } = useAuthContext();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNewRow, setShowNewRow] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getDocument('users', 'listaUsuarios');
            if (data) {
                let flatList = [];
                const traverse = (obj, path = []) => {
                    if (!obj) return;
                    if (typeof obj === 'object') {
                        if (obj.userId || obj.uid) {
                            flatList.push({
                                keyId: path[path.length - 1] || 'root',
                                path: path,
                                userId: obj.userId || obj.uid,
                                type: obj.type || '',
                                email: obj.email || ''
                            });
                        } else {
                            Object.entries(obj).forEach(([key, val]) => {
                                traverse(val, [...path, key]);
                            });
                        }
                    }
                };
                traverse(data);
                setUsersList(flatList);
            }
        } catch (error) {
            console.error("Error fetching users list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (userRole === 'ual' || userRole === 'admin' || userRole === 'ugaadmin')) {
            fetchUsers();
        }
    }, [user, userRole]);

    if (!user) {
        return <div className={styles.denied}>Debes iniciar sesión para ver esta página.</div>;
    }

    if (userRole !== 'ual' && userRole !== 'admin' && userRole !== 'ugaadmin') {
        return <div className={styles.denied}>Acceso Denegado. Solo UAL, Admin y UGA Admin pueden gestionar usuarios.</div>;
    }

    const handleSaveUser = async (userObj, formValues) => {
        try {
            const db = getFirestore(firebase_app);
            const docRef = doc(db, 'users', 'listaUsuarios');
            const fieldPath = userObj.path.join(".");
            const updatedData = {
                userId: formValues.userId.trim(),
                email: formValues.email.trim(),
                type: formValues.type
            };

            await updateDoc(docRef, {
                [fieldPath]: updatedData
            });

            setUsersList(prev => prev.map(u => u.keyId === userObj.keyId ? {
                ...u,
                userId: updatedData.userId,
                email: updatedData.email,
                type: updatedData.type
            } : u));
        } catch (error) {
            alert("Error al actualizar: " + error.message);
        }
    };

    const handleAddUser = async (formValues) => {
        const newKey = Date.now().toString();
        try {
            const db = getFirestore(firebase_app);
            const docRef = doc(db, 'users', 'listaUsuarios');
            const newUserData = {
                userId: formValues.userId.trim(),
                email: formValues.email.trim(),
                type: formValues.type
            };

            await updateDoc(docRef, {
                [newKey]: newUserData
            });

            setUsersList(prev => [...prev, {
                keyId: newKey,
                path: [newKey],
                userId: newUserData.userId,
                email: newUserData.email,
                type: newUserData.type
            }]);
            setShowNewRow(false);
        } catch (error) {
            alert("Error al registrar usuario: " + error.message);
        }
    };

    const handleDeleteUser = async (userObj) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar a ${userObj.email || userObj.userId} de la lista de acceso?`)) {
            return;
        }
        try {
            const db = getFirestore(firebase_app);
            const docRef = doc(db, 'users', 'listaUsuarios');
            const fieldPath = userObj.path.join(".");

            await updateDoc(docRef, {
                [fieldPath]: deleteField()
            });

            setUsersList(prev => prev.filter(u => u.keyId !== userObj.keyId));
        } catch (error) {
            alert("Error al eliminar usuario: " + error.message);
        }
    };

    const filteredUsers = usersList.filter(u => {
        const q = search.toLowerCase();
        return (
            u.email?.toLowerCase().includes(q) ||
            u.userId?.toLowerCase().includes(q) ||
            u.type?.toLowerCase().includes(q)
        );
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        Gestión de Usuarios
                        <span className={styles.subtitle}>{usersList.length} usuarios registrados</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className={styles.searchBar}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className={styles.btnAction} onClick={() => setShowNewRow(true)}>
                        + Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Cargando lista de usuarios...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Clave / Ruta</th>
                                <th>ID Usuario (UID)</th>
                                <th>Email / Propietario</th>
                                <th>Rol / Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showNewRow && (
                                <NuevoUserRow
                                    onSave={handleAddUser}
                                    onCancel={() => setShowNewRow(false)}
                                />
                            )}
                            {filteredUsers.length === 0 && !showNewRow ? (
                                <tr>
                                    <td colSpan="5" className={styles.loading}>
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <UserRow
                                        key={u.keyId}
                                        userItem={u}
                                        onSave={handleSaveUser}
                                        onDelete={handleDeleteUser}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default function GestionUsuariosPage() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <GestionUsuariosContent />
            </DataContextProvider>
        </AuthContextProvider>
    );
}
