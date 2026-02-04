'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import styles from './Pumba.module.css'
import HeaderPumba from "./components/headerPumba";
import BodyPumba from "./components/BodyPumba";
import { useState } from 'react'

export default function Pumba() {
    const [dateToUse, setDateToUse] = useState('');
    return (
        <>
            <AuthContextProvider>
                <DataContextProvider>
                    <div className={styles.container}>
                        <HeaderPumba setDateToUse={setDateToUse} />
                        <BodyPumba dateToUse={dateToUse} />
                    </div>
                </DataContextProvider>
            </AuthContextProvider>
        </>
    )
}