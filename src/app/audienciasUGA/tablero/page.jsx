'use client'
import { DataContextProvider } from "@/context/DataContext";
import { AudienciaList } from "./components/AudienciaList";

export default function Admin() {
    return (
      <>
            <DataContextProvider>
                <AudienciaList/>
            </DataContextProvider>
      </>
    )
}