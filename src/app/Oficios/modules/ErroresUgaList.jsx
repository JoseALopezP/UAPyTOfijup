import { useContext } from 'react';
import styles from '../Oficios.module.css';
import { DataContext } from '@/context New/DataContext';

export default function ErroresUgaList({ aud, date, errores, setErrores }) {
    const { updateData } = useContext(DataContext);

    const handleToggleEstado = async (index) => {
        const updatedErrores = errores.map((error, i) =>
            i === index ? { ...error, estado: !error.estado } : error
        );
        setErrores(updatedErrores);
        await updateData(date, aud.id, 'erroresUga', updatedErrores);
    };

    const handleRemoveError = async (index) => {
        const newErrores = errores.filter((_, i) => i !== index);
        setErrores(newErrores);
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', newErrores, (aud.aId || false));
    };

    return (
        <div className={`${styles.erroresListBlock}`}>
            {errores.map((el, i) => (
                <span
                    key={`${el.tipo}-${el.comentario}`}
                    className={`${styles.tableRowErrores} ${el.estado ? styles.tableRowErroresSolved : ''}`}
                >
                    <p className={`${styles.errorListTipo}`}>{el.tipo}</p>
                    <p className={`${styles.errorListComentario}`}>{el.comentario}</p>
                    <button
                        onClick={() => handleToggleEstado(i)}
                        className={`${styles.errorListEstado}`}
                    >
                        {el.estado ? '✔' : 'X'}
                    </button>
                    <button
                        onClick={() => handleRemoveError(i)}
                        className={`${styles.errorListDel}`}>
                        🗑️
                    </button>
                </span>
            ))}
        </div>
    );
}