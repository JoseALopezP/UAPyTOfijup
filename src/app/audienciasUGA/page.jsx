'use client'
import { DataContextProvider } from "@/context/DataContext";
import { AudienciaList } from "../audienciasUAC/tablero/components/AudienciaList";

export default function Admin() {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <>
          <DataContextProvider>
          </DataContextProvider>
      </>
    )
}