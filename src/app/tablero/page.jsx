'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { InformationSection } from "./components/InformationSection";
import { ScheduleTable } from "./components/ScheduleTable";
import { DataContextProvider } from "@/context New/DataContext";
import { useState } from "react";

export default function Tablero() {
  const [filterValue, setFilterValue] = useState('')
    return (
      <>
        <AuthContextProvider>
        <DataContextProvider>
          <InformationSection setFilterValue={setFilterValue} filterValue={filterValue}/>
          <ScheduleTable filterValue={filterValue}/>
        </DataContextProvider>
        </AuthContextProvider>
      </>
    )
}