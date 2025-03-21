'use client'
import { useState } from 'react';
import styles from '../RegistroAudiencia.module.css';

export default function EditHitos({hitos, isHovered}) {
    const [hitosAux, setHitosAux] = useState(hitos)
    const handleInputChange = (index, key, value) => {
        setter(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };
    return (
        <div className={isHovered ? `${styles.editHitosBlock} ${styles.editHitosBlockHovered}` : `${styles.editHitosBlock}`}>
            {hitos && hitos.map((el, i) => {
                return(<><span className={`${styles.hitoIndiv}`}>
                <input type="text" value={el.split(' | ')[0].split(':')[0]} min={0} max={24} onChange={(e) => handleInputChange(i, 'nombre', e.target.value)}/>
                <input type="text" value={el.split(' | ')[0].split(':')[1]} min={0} max={60}/>
                <p>{el.split(' | ')[1]}</p>
                </span></>)
            })}
            <button>GUARDAR</button>
        </div>
    );
}