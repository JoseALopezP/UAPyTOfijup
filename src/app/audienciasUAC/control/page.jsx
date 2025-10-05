'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { AudienciaAddList } from "../components/AudienciaAddList";
import { DataContextProvider } from "@/context/DataContext";

export default function Home({params}) {
    return (
      <>
          <AuthContextProvider>
          <DataContextProvider>
            <AudienciaAddList date={params.date}/>
          </DataContextProvider>
          </AuthContextProvider>
      </>
    )
}