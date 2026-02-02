'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import styles from './Pumba.module.css'
import HeaderPumba from "./components/headerPumba";
import BodyPumba from "./components/BodyPumba";

export default function Pumba() {
    return (
        <>
            <AuthContextProvider>
                <DataContextProvider>
                    <div className={styles.container}>
                        <HeaderPumba />
                        <BodyPumba />
                    </div>
                </DataContextProvider>
            </AuthContextProvider>
        </>
    )
}