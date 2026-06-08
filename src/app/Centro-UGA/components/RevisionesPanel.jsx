import styles from '../centroUga.module.css';

export default function RevisionesPanel() {
    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>Lista de Revisiones Pendientes</h2>
            <div className={styles.card}>
                <p className={styles.textMuted}>Próximamente: Aquí se visualizarán los tickets de errores a corregir en las audiencias.</p>
            </div>
        </div>
    );
}
