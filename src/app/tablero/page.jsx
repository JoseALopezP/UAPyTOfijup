'use client'
import { InformationSection } from "./components/InformationSection";
import { ScheduleTable } from "./components/ScheduleTable";
import { DataContextProvider } from "@/context/DataContext";

export default function Tablero() {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <>
        <DataContextProvider>
          <InformationSection/>
          <ScheduleTable/>
        </DataContextProvider>
      </>
    )
}