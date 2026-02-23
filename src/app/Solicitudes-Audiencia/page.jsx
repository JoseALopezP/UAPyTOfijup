'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";

export default function Page() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
            </DataContextProvider>
        </AuthContextProvider>
    )
}