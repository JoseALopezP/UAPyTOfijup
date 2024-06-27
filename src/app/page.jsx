'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { InformationSection } from "./tablero/components/InformationSection";
import { ScheduleTable } from "./tablero/components/ScheduleTable";
import { DataContextProvider } from "@/context/DataContext";

export default function Tablero() {
    return (
      <>
        <AuthContextProvider>
        <DataContextProvider>
          <InformationSection/>
          <ScheduleTable/>
        </DataContextProvider>
        </AuthContextProvider>
      </>
    )
}
