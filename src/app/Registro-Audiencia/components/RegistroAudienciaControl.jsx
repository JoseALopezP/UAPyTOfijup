import { useContext, useEffect } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import RegistroAudienciaLeft from './RegistroAudienciaLeft';
import RegistroAudienciaRight from './RegistroAudienciaRight';

export default function RegistroAudienciaControl({ aud, dateToUse, isHovered}) {
    const {updateDesplegables} = useContext(DataContext)
    useEffect(() => {
        updateDesplegables()
    }, [])
    return (
        <div className={`${styles.controlBlock}`}>
            {aud && <><RegistroAudienciaLeft item={aud} dateToUse={dateToUse} isHovered={isHovered}/>
            <RegistroAudienciaRight item={aud} dateToUse={dateToUse}/></>}
        </div>
    );
}