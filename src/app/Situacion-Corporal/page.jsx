'use client'
import styles from './SituacionCorporal.module.css'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';
import SitCorporalBlock from './components/SitCorporalBlock';

export default function Home() {
  return (
    <AuthContextProvider>
        <DataContextProvider>
          <SitCorporalBlock />
      </DataContextProvider>
    </AuthContextProvider>
  );
}