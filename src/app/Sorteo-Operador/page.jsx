'use client'
import styles from './sorteoOperador.module.css'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';
import SorteoBlock from './components/SorteoBlock';
import ListBlock from './components/ListBlock';

export default function Page() {
    return (
        <AuthContextProvider><DataContextProvider>
        <div className={styles.containerBlock}>
            <SorteoBlock/>
            <ListBlock/>
        </div>
        </DataContextProvider></AuthContextProvider>
    );
}
