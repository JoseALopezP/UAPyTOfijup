import styles from './InputReloj.module.css';

export default function InputReloj({horaF, minutF, hora, minut}) {
  return (
    <span className={`${styles.clockBlock}`}>
        <input className={`${styles.inputHora}`} type='text' min="0" max="24" value={hora} onChange={e => horaF(e.target.value)}/>
        <p className={`${styles.inputSeparator}`}>:</p>
        <input className={`${styles.inputMinut}`} type='text' min="0" max="59" value={minut} onChange={e => minutF(e.target.value)}/>
    </span>
  );
}