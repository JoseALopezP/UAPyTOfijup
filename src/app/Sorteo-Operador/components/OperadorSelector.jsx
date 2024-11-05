import styles from '../sorteoOperador.module.css';
import { nameTranslate } from '@/utils/traductorNombres';

export default function OperadorSelector({ originalList, originalListFunction, selectedList, selectedListFunction }) {
    const handleClickOperadorAdd = (element) => {
        const updatedOriginalList = originalList.filter(el => el !== element);
        const updatedSelectedList = [...selectedList, element];
        originalListFunction(updatedOriginalList);
        selectedListFunction(updatedSelectedList);
    };

    const handleClickOperadorRemove = (element) => {
        const updatedSelectedList = selectedList.filter(el => el !== element);
        const updatedOriginalList = [...originalList, element];
        selectedListFunction(updatedSelectedList);
        originalListFunction(updatedOriginalList);
    };

    return (
        <div className={styles.operadorSelectorBlock}>
            <h2 className={styles.operadorSelectorTitle}>OPERADOR</h2>
            <div className={styles.listaTableBlock}>
                <span className={`${styles.listaSelector} ${styles.listaSelectorLeft}`}>
                    <h3 className={styles.operadorSelectorTitle}>LISTA</h3>
                    {originalList && originalList.map((el) => (
                        <span key={el} className={styles.operadorListItem} onClick={() => handleClickOperadorAdd(el)}>
                            {nameTranslate(el)}
                        </span>
                    ))}
                </span>
                <span className={styles.listaSelector}>
                    <h3 className={styles.operadorSelectorTitle}>SELECCIONADOS</h3>
                    {selectedList && selectedList.map((el) => (
                        <span key={el} className={styles.operadorListItem} onClick={() => handleClickOperadorRemove(el)}>
                            {nameTranslate(el)}
                        </span>
                    ))}
                </span>
            </div>
        </div>
    );
}