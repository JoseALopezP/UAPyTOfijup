import styles from './informacion.module.css'

export function BlockCarga () {
    const handleSubmit = () =>{

    }
    return(
        <section className={`${styles.cargaSection}`}>
            <div className={`${styles.inputDiv}`}>
            <h2>AGREGAR UN NUEVO DOCUMENTO</h2>
            <form action="" className={`${styles.inputForm}`}>
                <label>TÍTULO</label>
                <input type="text" />
                <label>CUERPO</label>
                <input type="textarea" />
                <label>IMÁGEN</label>
                <input type="file" />
                <label>FECHA INICIO</label>
                <input type="date" />
                <label>FECHA FIN</label>
                <button type="submit" className={`${styles.submitButton}`}>AGREGAR</button>
            </form>
            </div>
        </section>
    )
}