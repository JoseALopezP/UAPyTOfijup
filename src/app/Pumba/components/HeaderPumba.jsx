'use client'
import styles from '../Pumba.module.css'
import Image from 'next/image'

export default function HeaderPumba() {
    return (
        <><div className={styles.headerContainer}>
            <Image src="pumbaLogo.png" alt="Logo" color='white' width={100} height={100} />
        </div></>
    )
}