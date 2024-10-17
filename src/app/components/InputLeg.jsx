import styles from './InputReloj.module.css';

export default function InputLeg({horaF, minutF, hora, minut}) {
  return (
    <span className={`${styles.clockBlock}`}>
        <input className={`${styles.inputHora}`} value={hora} onChange={e => horaF(e.target.value)}/>

        <input className={`${styles.inputMinut}`} value={minut} onChange={e => minutF(e.target.value)}/>
    </span>
  );
}