'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
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
