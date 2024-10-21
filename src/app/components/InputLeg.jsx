import styles from './InputReloj.module.css';
import { useState } from 'react';

export default function InputLeg({legajo, setLegajo}) {
  const [legAno, setLegAno] = useState('-')
  const [legNum, setLegNum] = useState('-')
  
  return (
    <span className={`${styles.clockBlock}`}>
        <input className={`${styles.inputHora}`} value={hora} onChange={e => horaF(e.target.value)}/>
        <input className={`${styles.inputMinut}`} value={minut} onChange={e => minutF(e.target.value)}/>
    </span>
  );
}