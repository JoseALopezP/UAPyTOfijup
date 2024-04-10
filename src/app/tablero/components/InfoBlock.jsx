import styles from './ScheduleTable.module.css'

export function InfoBlock () {
    return(
        <div className={`${styles.infoBlock}`}>
            <h1 className={`${styles.ofijupTitle}`}>OFICINA JUDICIAL PENAL</h1>
            <img src="https://dipascuale.com/wp-content/uploads/2013/05/DiPascuale-Foto-Lapana-05.jpg" className={`${styles.infoImg}`} />
            <div className={`${styles.textBlock}`}>
                <h2 className={`${styles.newsTitle}`}>OFIJUP PROMOVIENDO DESARROLLOS LOCALES</h2>
                <p className={`${styles.newsBody}`}>
                    Nuestro compromiso no solo se limita a la justicia, gracias al desarrollo de las actividades de la Oficina Juidical Penal es que se han generado 10 nuevos puestos de trabajo en LaPana.
                </p>
            </div>
        </div>
    )
}