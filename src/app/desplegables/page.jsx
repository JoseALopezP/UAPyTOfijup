'use client'
import { DataContextProvider } from "@/context New/DataContext";
import Desplegables from "./Desplegables";
import { AuthContextProvider } from "@/context New/AuthContext";

export default function Page() {
    return (
      <>
            <AuthContextProvider>
            <DataContextProvider>
                <Desplegables/>
            </DataContextProvider>
            </AuthContextProvider>
      </>
    )
}