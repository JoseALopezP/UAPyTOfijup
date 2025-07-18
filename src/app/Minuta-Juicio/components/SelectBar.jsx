'use client'
import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/context/DataContext';
import styles from '../MinutaJuicio.module.css'
import AudList from './AudList';

export default function SelectBar({selectedList, setSelectedList}) {
    const {updateByLegajo, byLegajo, desplegables, updateDesplegables} = useContext(DataContext);
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const updateLegajo = () => {
        updateByLegajo(legajo1+'-'+legajo2+'-'+legajo3)
    }
    useEffect(() => {
        updateDesplegables()
    }, [])
    return (
        <div className={`${styles.leftColumn}`}><section className={`${styles.selectorBar}`}>
            <span className={`${styles.legajoSelectorBlock}`}><input
                list="legajoPrefijo"
                value={legajo1}
                className={`${styles.legajo1}`}
                onChange={(e) => setLegajo1(e.target.value)}
            />
            <datalist id="legajoPrefijo" className={`${styles.tableCellInput}`}>
                {desplegables.legajosPrefijo &&
                desplegables.legajosPrefijo.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>
                ))}
            </datalist>
            <input
                className={`${styles.legajo2}`}
                min="1"
                max="99999"
                id="IngresarNumero"
                placeholder="00000"
                value={legajo2}
                onChange={(e) => setLegajo2(e.target.value)}
            />
            <input
                list="anio"
                className={`${styles.legajo3}`}
                placeholder="1970"
                value={legajo3}
                onChange={(e) => setLegajo3(e.target.value)}
            />
            <button type='button' className={`${styles.buttonSearch}`} onClick={() => updateLegajo()}>BUSCAR</button></span>
        </section>
        <AudList list={byLegajo /*.filter(value => value.tipo === "DEBATE")*/} setSelected={setSelectedList} selectedList={selectedList}/></div>
    )
}