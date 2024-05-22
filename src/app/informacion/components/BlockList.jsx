import styles from './informacion.module.css'

export function BlockList () {
    return(
        <section className={`${styles.listSection}`}>
            <div className={`${styles.tableBlock}`}>
            {[...Array(10)].map(()=>{
                return(<div className={`${styles.tableRow}`}>
                    <span className={`${styles.tableCell}`}>
                        <img src='https://dipascuale.com/wp-content/uploads/2013/05/DiPascuale-Foto-Lapana-05.jpg' className={`${styles.tableCell} ${styles.infoImg}`}/>
                    </span>
                    <span className={`${styles.tableCell} ${styles.tableCellText}`}>
                        <p className={`${styles.infoTitle}`}>LaPana</p>
                        <p className={`${styles.infoBodyText}`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</p>
                    </span>
                    <span className={`${styles.tableCell} ${styles.lastBlock}`}>
                        <button className={`${styles.tableCell} ${styles.deleteButton}`}>ELIMINAR</button>
                        <p className={`${styles.infoBodyText}`}>22/05/24 - 30/05/24</p>
                    </span>
                </div>)
            })}
            </div>
        </section>
    )
}