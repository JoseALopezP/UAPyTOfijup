'use client'

import HeaderSolicitudes from "./HeaderSolicitudes"
import TableSol from "./TableSol"
import styles from "../SolicitudesAudiencia.module.css"


export default function SolicitudesBlock() {
    return (
        <div className={styles.containerSol}>
            <HeaderSolicitudes />
            <TableSol />
        </div>
    )
}