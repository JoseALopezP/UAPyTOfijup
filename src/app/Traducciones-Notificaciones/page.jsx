'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import TraduccionesManager from './components/TraduccionesManager';

export default function page() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <TraduccionesManager />
            </DataContextProvider>
        </AuthContextProvider>
    )
}
