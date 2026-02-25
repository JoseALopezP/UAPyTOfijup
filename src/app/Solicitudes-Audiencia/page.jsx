'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import SolicitudesBlock from "./components/SolicitudesBlock";

export default function Page() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <SolicitudesBlock />

            </DataContextProvider>
        </AuthContextProvider>
    )
}