import { useContext } from 'react';
import styles from '../Oficios.module.css';
import { DataContext } from '@/context/DataContext';

export default function ErroresUgaList({ aud, date, errores, setErrores }) {
    const { updateData } = useContext(DataContext);

    const handleToggleEstado = async (index) => {
        // Update the local state
        const updatedErrores = errores.map((error, i) =>
            i === index ? { ...error, estado: !error.estado } : error
        );
        
        setErrores(updatedErrores);

        // Immediately update Firebase with the new `errores` array
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', updatedErrores);
    };

    const handleRemoveError = async (index) => {
        // Remove the error from the list
        const newErrores = errores.filter((_, i) => i !== index);
        
        setErrores(newErrores);

        // Update Firebase with the updated `errores` array
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', newErrores);
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