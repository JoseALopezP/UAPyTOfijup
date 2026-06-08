import styles from '../sorteoOperador.module.css'

const filterOptions = ['OPERADOR','HORA','TIPO','JUEZ','DURACIÓN']

export default function SorteoFilterBar({filtroValue, setFiltroValue, operadorFilled, setOperadorFilled}) {
    return (
        <div className={styles.sorteoFilterBarBlock}>
            <button className={`${styles.buttonFilterOption} ${styles.buttonOperadorFilled}`} onClick={() => setOperadorFilled(operadorFilled==='TODOS' ? 'S/OPERADOR' : (operadorFilled==='S/OPERADOR' ? 'C/OPERADOR' : 'TODOS'))}>{operadorFilled}</button>
            {filterOptions.map(el=>(
                <button onClick={()=>setFiltroValue(filtroValue === el ? '' : el)} key={el} className={filtroValue === el ? `${styles.buttonFilterOption} ${styles.buttonFilterOptionSelected}` : `${styles.buttonFilterOption}`}>{el}</button>
            ))}
        </div>
    );
}