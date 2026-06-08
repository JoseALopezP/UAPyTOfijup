'use client'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';
import CentroUGA from './components/CentroUGA';

export default function Page() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <CentroUGA />
            </DataContextProvider>
        </AuthContextProvider>
    );
}
