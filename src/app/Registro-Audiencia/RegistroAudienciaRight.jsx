import { useContext, useEffect } from 'react';
import styles from './RegistroAudiencia.module.css';
import RegistroChangeState from './RegistroChangeState';
import { DataContext } from '@/context/DataContext';

export default function RegistroAudienciaRight({ aud }) {
    const {updateDesplegables, desplegables, updateByDate, bydate} = useContext(DataContext)

    useEffect(() => {
        updateDesplegables()
    }, [])
    return (
        <div className={`${styles.controlBlockRight}`}>
        </div>
    );
}