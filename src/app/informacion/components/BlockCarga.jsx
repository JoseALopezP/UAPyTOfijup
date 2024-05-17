import styles from './informacion.module.css'

export function BlockCarga () {
    return(
        <section className={`${styles.cargaSection}`}>
            <div className={`${styles.inputDiv}`}>
            <h2>AGREGAR UN NUEVO DOCUMENTO</h2>
            <form action="" className={`${styles.inputForm}`}>
                <label>TÍTULO</label>
                <input type="text" />
                <label>CUERPO</label>
                <label>IMÁGEN</label>
                <label>FECHA INICIO</label>
                <label>FECHA FIN</label>
            </form>
            </div>
        </section>
    )
}