'use client'
import { DataContextProvider } from "@/context/DataContext";

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