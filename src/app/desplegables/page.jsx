'use client'
import { DataContextProvider } from "@/context/DataContext";
import Desplegables from "./Desplegables";
import { AuthContextProvider } from "@/context/AuthContext";

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