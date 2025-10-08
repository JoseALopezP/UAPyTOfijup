'use client'
import { DataContextProvider } from '@/context New/DataContext';
import { AuthContextProvider } from '@/context New/AuthContext';
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