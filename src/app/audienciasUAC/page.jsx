'use client'
import { DataContextProvider } from "@/context New/DataContext";

export default function Admin() {
    return (
      <>
          <DataContextProvider>
          </DataContextProvider>
      </>
    )
}