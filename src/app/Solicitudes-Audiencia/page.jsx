'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
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
