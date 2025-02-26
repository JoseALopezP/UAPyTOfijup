import { useContext, useEffect } from 'react';
import styles from '../listasDesplegables.module.css'
import { DataContext } from '@/context/DataContext';

export default function DesplegablesList({desplegableFunction}) {
    const { updateDesplegables, desplegables } = useContext(DataContext);
    const consoleLogDesplegables = () =>{
        console.log(desplegables)
    }
    useEffect(() => {
        updateDesplegables()
        console.log(desplegables)
    }, [])
    return (
        <div className={styles.listasDesplegablesSelector}>
            <>{desplegables && Object.keys(desplegables).map((key)=>(
                <div key={key} className={styles.listIndiv} onClick={()=>desplegableFunction(key)}><p>{key}</p></div>
            ))}</>
        </div>
    )
}