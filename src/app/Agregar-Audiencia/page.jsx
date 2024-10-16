'use client'
import { AuthContextProvider } from '@/context/AuthContext';
import { AddAudienciaBlock } from "./components/AddAudienciaBlock";

import { DataContextProvider } from '@/context/DataContext';

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