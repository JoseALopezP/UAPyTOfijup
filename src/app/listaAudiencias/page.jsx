import { AudienciaList } from "./components/AudienciaList";
import { useContext } from "react";
import { DataContextProvider } from "@/context/DataContext";

export default function listaAudiencias() {
  /*useEffect(() => {
    if (user == null) router.push("/signin")
  }, [user]) */
  return (
    <>
    <DataContextProvider>
      <AudienciaList/>
    </DataContextProvider>
      
    </>
  )
}