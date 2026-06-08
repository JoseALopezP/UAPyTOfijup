import { useState } from 'react';
import styles from '../centroUga.module.css';
import RevisionesPanel from './RevisionesPanel';
import SorteoPanel from './SorteoPanel';
import AnaliticasPanel from './AnaliticasPanel';
import SimulacionPanel from './SimulacionPanel';

export default function CentroUGA() {
    const [activeTab, setActiveTab] = useState('sorteo');
    const [revisionesCount, setRevisionesCount] = useState(0); // Próximamente se conectará a Firebase

    // Lógica para color del badge
    let badgeColor = '#569CD6'; // 0 = Azul
    if (revisionesCount > 0 && revisionesCount < 10) badgeColor = '#ffc107'; // < 10 = Amarillo
    else if (revisionesCount >= 10) badgeColor = '#F44336'; // >= 10 = Rojo

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'revisiones' ? styles.tabButtonActive : ''}`} 
                    onClick={() => setActiveTab('revisiones')}
                >
                    Revisiones / Errores 
                    <span className={styles.badge} style={{ backgroundColor: badgeColor }}>
                        {revisionesCount}
                    </span>
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'sorteo' ? styles.tabButtonActive : ''}`} 
                    onClick={() => setActiveTab('sorteo')}
                >
                    Sorteo y Asignación
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'simulacion' ? styles.tabButtonActive : ''}`} 
                    onClick={() => setActiveTab('simulacion')}
                >
                    Simulación de Sorteo
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'analiticas' ? styles.tabButtonActive : ''}`} 
                    onClick={() => setActiveTab('analiticas')}
                >
                    Dashboard Analítico
                </button>
            </div>
            
            <div className={styles.content}>
                {activeTab === 'revisiones' && <RevisionesPanel />}
                {activeTab === 'sorteo' && <SorteoPanel />}
                {activeTab === 'simulacion' && <SimulacionPanel />}
                {activeTab === 'analiticas' && <AnaliticasPanel />}
            </div>
        </div>
    );
}
