'use client'
import { AudienciaAddList } from "./components/AudienciaAddList";
import { DataContextProvider } from "@/context/DataContext";

export default function Admin() {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <>
          <DataContextProvider>
            <AudienciaAddList/>
          </DataContextProvider>
      </>
    )
}