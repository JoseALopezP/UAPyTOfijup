'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { AudienciaAddList } from "../components/AudienciaAddList";
import { DataContextProvider } from "@/context/DataContext";

export default function Home({params}) {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
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