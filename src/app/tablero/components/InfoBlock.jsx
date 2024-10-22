import styles from './ScheduleTable.module.css'


export function InfoBlock () {
    return(
        <div className={`${styles.infoBlock}`}>
            <h1 className={`${styles.ofijupTitle}`}>OFICINA JUDICIAL PENAL</h1>
            <img src="./informe.png" className={`${styles.infoImg}`} />
            <div className={`${styles.textBlock}`}>
                <h2 className={`${styles.newsTitle}`}>AUDIENCIAS POR AÑO</h2>
                <p className={`${styles.newsBody}`}>
                    Audiencias celebradas por año en la Oficina Judicial Penal
                </p>
            </div>
        </div>
    )
}