import styles from '../listasDesplegables.module.css'

export default function Selector({listSelection, setListSelection}) {
    return (
        <span className={styles.listSelector}>
            <button className={ listSelection === 'desplegables' ? `${styles.buttonSelector} ${styles.buttonSelected}` : `${styles.buttonSelector}`} type='button' onClick={() => setListSelection('desplegables')}>
                desplegables
            </button>
            <button className={ listSelection === 'feriados' ? `${styles.buttonSelector} ${styles.buttonSelected}` : `${styles.buttonSelector}`} type='button' onClick={() => setListSelection('feriados')}>
                feriados
            </button>
        </span>
    )
}