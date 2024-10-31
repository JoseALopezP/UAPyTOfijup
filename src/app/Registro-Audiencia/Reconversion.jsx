import styles from './RegistroAudiencia.module.css'
import { useContext, useEffect} from 'react'
import { DataContext } from '@/context/DataContext';


export function Reconversion({ item, setTipo, setTipo2, setTipo3, tipo, tipo2, tipoAux, tipo2Aux}) {
    const {updateTiposAudiencias, tiposAudiencias} = useContext(DataContext);
    useEffect(() => {
        updateTiposAudiencias()
    }, [])
    return (
    <div className={`${styles.reconversionBlock}`} onSubmit={(event) => handleSubmit(event)}>
        <div className={`${styles.inputTipos}`}>
        <input list="tipo1" className={`${styles.inputLeft} ${styles.inputLeft100}`} placeholder={item.tipo} onChange={(e)=>{setTipo(e.target.value)}}/>
        <datalist id='tipo1'>
            {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
        </datalist>
        {(tipo === tipoAux) ||
        <>
            <input list="tipo2" className={`${styles.inputLeft} ${styles.inputLeft100}`} placeholder={item.tipo2} onChange={(e)=>{setTipo2(e.target.value)}}/>
            <datalist id='tipo2'>
                {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </datalist>
        </>}
        {((tipo === tipoAux) || (tipo2 === tipo2Aux)) ||
            <>
            <input list="tipo3" className={`${styles.inputLeft} ${styles.inputLeft100}`} placeholder={item.tipo3} onChange={(e)=>{setTipo3(e.target.value)}}/>
            <datalist id='tipo3'>
                {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </datalist>
            </>}
            </div>
    </div>);
}