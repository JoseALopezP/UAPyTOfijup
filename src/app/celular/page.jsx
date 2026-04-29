'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
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
