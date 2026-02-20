'use client';
import { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase_app from "@/firebase/config";

const professionalsList = [
    "Dr. Maximiliano Blejman",
    "Dr. Juan Carlos Caballero Vidal",
    "Dr. Benedicto Walter Correa Patiño",
    "Dr. Fabio Daniel Guillen Alonso",
    "Dr. Martin Heredia Zaldo",
    "Dra. Ana Lia Larrea",
    "Dra. Maria Silvina Rosso de Balanza",
    "Dr. Mario Guillermo Adarvez",
    "Dra. Flavia Gabriela Allende",
    "Dr. Eugenio Maximiliano Barbera",
    "Dr. Ramón Alberto Caballero",
    "Dra. Gloria Verónica Chicon",
    "Dr. Gerardo Javier Fernandez Caussi",
    "Dr. Rodolfo Javier Figuerola",
    "Dra. María Gema Guerrero",
    "Dr. Pablo Leonardo León",
    "Dr. Sergio Lopez Marti",
    "Dra. Mónica Lucero",
    "Dra. Celia Leonor Maldonado",
    "Dr. Juan Gabriel Meglioli",
    "Dra. Mabel Irene Moya",
    "Dra. Ana Carolina Parra",
    "Dr. Matías Francisco Parrón",
    "Dra. Lidia Reverendo",
    "Dr. Federico Marcelo Rodríguez",
    "Dr. Federico Emiliano Zapata",
    "Dr. Diego Manuel Sanz",
    "Dr. Renato Roca",
    "Dr. Eduardo Oscar Raed",
    "Dr. Victor Hugo Muñoz Carpino",
    "Dr. Roberto Jorge Montilla",
    "Dr. Mariano Daniel Carrera Pedrotti",
    "Dra. María Julia Camus"
];

const db = getFirestore(firebase_app);
const auth = getAuth(firebase_app);

export default function MaintenancePage() {
    const [status, setStatus] = useState('idle');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpdate = async () => {
        if (!user) {
            alert("No estás logueado. Por favor, inicia sesión en la app principal.");
            return;
        }
        setStatus('updating');
        try {
            console.log(`Preparing to replace jueces with ${professionalsList.length} items...`);
            const docRef = doc(db, "desplegables", "desplegables");
            await updateDoc(docRef, {
                jueces: professionalsList
            });
            setStatus('success');
            alert("¡Lista actualizada con éxito!");
        } catch (e) {
            console.error("Error updating document: ", e);
            setStatus('error');
            alert("Error al actualizar: " + e.message);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando estado...</div>;

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Mantenimiento de Firebase</h1>

            <div style={{
                marginBottom: '20px',
                padding: '10px',
                background: user ? '#e8f5e9' : '#ffebee',
                border: user ? '1px solid #4CAF50' : '1px solid #f44336',
                borderRadius: '5px'
            }}>
                {user ? (
                    <p style={{ color: '#2e7d32', margin: 0 }}>✅ Sesión activa: <strong>{user.email}</strong></p>
                ) : (
                    <p style={{ color: '#d32f2f', margin: 0 }}>❌ <strong>SIN SESIÓN:</strong> Haz login en la app primero.</p>
                )}
            </div>

            <p>Esta página permite reemplazar la lista entera de <strong>jueces</strong> en Firestore.</p>
            <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', display: 'inline-block' }}>
                <h3>Lista a cargar ({professionalsList.length} profesionales):</h3>
                <div style={{ maxHeight: '200px', overflowY: 'scroll', textAlign: 'left', fontSize: '12px', background: '#f9f9f9', padding: '10px' }}>
                    {professionalsList.map((p, i) => <div key={i}>{p}</div>)}
                </div>
            </div>
            <br />
            <button
                onClick={handleUpdate}
                disabled={!user || status === 'updating' || status === 'success'}
                style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    backgroundColor: status === 'success' ? '#4CAF50' : '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: (!user || status === 'updating' || status === 'success') ? 'not-allowed' : 'pointer',
                    opacity: !user ? 0.5 : 1
                }}
            >
                {status === 'idle' && 'Reemplazar Lista de Jueces'}
                {status === 'updating' && 'Actualizando...'}
                {status === 'success' && '¡Actualizado!'}
                {status === 'error' && 'Error - Reintentar'}
            </button>
            {status === 'success' && (
                <p style={{ color: 'green', marginTop: '20px' }}>
                    Se actualizó el campo <code>jueces</code> correctamente.
                </p>
            )}
        </div>
    );
}
