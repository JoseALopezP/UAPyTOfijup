'use client'
import styles from './informacion.module.css'

export function BlockCarga () {
    const handleFileClick = () =>{
        document.getElementById('getFile').click()
    }
    const handleSubmit = (event) =>{
        event.preventDefault();
    }
    return(
        <section className={`${styles.cargaSection}`}>
            <div className={`${styles.inputDiv}`}>
            <h2>AGREGAR UN NUEVO DOCUMENTO</h2>
            <form action="" className={`${styles.inputForm}`}>
                <label className={`${styles.inputTitle}`}>TÍTULO</label>
                <input type="text" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>CUERPO</label>
                <input type="textarea" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>IMÁGEN</label>
                <button type='button' onClick={() => handleFileClick()} className={`${styles.inputButton}`}>Your text here</button>
                <input type="file" id='getFile' className={`${styles.inputFile}`}/>
                <label className={`${styles.inputTitle}`}>FECHA INICIO</label>
                <input type="date" className={`${styles.inputText}`}/>
                <label className={`${styles.inputTitle}`}>FECHA FIN</label>
                <input type="date" className={`${styles.inputText}`}/>
                <button type="submit" className={`${styles.submitButton} ${styles.inputButton}`}>AGREGAR</button>
            </form>
            </div>
        </section>
    )
}