'use client'
import { useState } from 'react';
import styles from './sorteoOperador.module.css'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';
import SorteoBlock from './SorteoBlock';
import SorteoFilterBar from './SorteoFilterBar';

export default function Page() {
    return (
        <AuthContextProvider><DataContextProvider>
        <div className={[styles.container]}>
            <SorteoBlock/>
            <SorteoFilterBar/>
        </div>
        </DataContextProvider></AuthContextProvider>
    );
}
