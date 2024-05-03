'use client'
import { DataContextProvider } from "@/context/DataContext";
import { AudienciaList } from "./components/AudienciaList";
import { AuthContextProvider } from "@/context/AuthContext";

export default function Admin() {
    return (
      <>
          <AuthContextProvider>
            <DataContextProvider>
                <AudienciaList/>
            </DataContextProvider>
          </AuthContextProvider>
      </>
    )
}