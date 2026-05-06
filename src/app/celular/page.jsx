'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import MobileBoard from "./components/MobileBoard";

export default function CelularPage() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <MobileBoard />
            </DataContextProvider>
        </AuthContextProvider>
    )
}

