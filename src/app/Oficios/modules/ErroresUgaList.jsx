import { DataContext } from '@/context/DataContext'
import styles from '../Oficios.module.css'
import { useContext } from 'react'

export default function ErroresUgaList({aud}) {
    const {bydate} = useContext(DataContext)
    return (
        <div className={`${styles.errroresListBlock}`}>
            {aud.errores && aud.errores.map(el =>(
                <span className={`${styles.tableHead}`}>
                    <p>{el.tipo}</p>
                    <p>{el.comentario}</p>
                    <p>{el.estado}</p>
                </span>
            ))}
        </div>
    )
}