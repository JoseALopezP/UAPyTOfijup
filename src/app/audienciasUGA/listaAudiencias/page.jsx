'use client'
import { AudienciaList } from "./components/AudienciaList";
import { DataContextProvider } from "@/context/DataContext";
import { AuthContextProvider } from "@/context/AuthContext";

export default function listaAudiencias() {
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