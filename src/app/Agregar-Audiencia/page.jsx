'use client'
import { AuthContextProvider } from '@/context New/AuthContext';
import { AddAudienciaBlock } from "./components/AddAudienciaBlock";
import { DataContextProvider } from '@/context New/DataContext';

export default function Page() {
    return (
    <>
        <AuthContextProvider>
        <DataContextProvider>
            <AddAudienciaBlock/>
        </DataContextProvider>
        </AuthContextProvider>
    </>
    )
}