'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import AbogadosManager from './components/AbogadosManager';

export default function page() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <AbogadosManager />
            </DataContextProvider>
        </AuthContextProvider>
    )
}

