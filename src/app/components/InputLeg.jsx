import styles from './InputReloj.module.css';
import { useState } from 'react';

export default function InputLeg({legajo, setLegajo}) {
  return (
    <span className={`${styles.clockBlock}`}>
        <input className={`${styles.inputLegajo}`} value={legajo} onChange={e => setLegajo(e.target.value)}/>
    </span>
  );
}