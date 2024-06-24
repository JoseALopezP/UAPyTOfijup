'use client'
import { DataContextProvider } from "@/context/DataContext";
import { AudienciaList } from "./components/AudienciaList";

export default function Home() {
    return (
      <>
      <DataContextProvider>
          <AudienciaList/>
      </DataContextProvider>
      </>
    )
}