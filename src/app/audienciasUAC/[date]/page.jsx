'use client'
import { AudienciaAddList } from "../components/AudienciaAddList";
import { DataContextProvider } from "@/context/DataContext";

export default function Home({params}) {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <>
          <DataContextProvider>
            <AudienciaAddList date={params.date}/>
          </DataContextProvider>
      </>
    )
}