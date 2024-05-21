import styles from './informacion.module.css'

export function BlockList () {
    return(
        <section className={`${styles.listSection}`}>
            <div className={`${styles.tableRow}`}>
                <span className={`${styles.tableCell}`}>
                    <img src='https://dipascuale.com/wp-content/uploads/2013/05/DiPascuale-Foto-Lapana-05.jpg' className={`${styles.tableCell} ${styles.infoImg}`}/>
                </span>
                <span className={`${styles.tableCell}`}>
                    <p>LaPana</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</p>
                </span>
                <span className={`${styles.tableCell}`}>
                <p className={`${styles.tableCell}`}></p>
                </span>
                <span className={`${styles.tableCell}`}>
                <button className={`${styles.tableCell}`}>ELIMINAR</button>
                </span>
            </div>
        </section>
    )
}