'use client'

import HeaderSolicitudes from "./HeaderSolicitudes"
import TableSol from "./TableSol"
import styles from "../SolicitudesAudiencia.module.css"


export default function SolicitudesBlock() {
    return (
        <container className={styles.containerSol}>
            <HeaderSolicitudes />
            <TableSol />
        </container>
    )
}