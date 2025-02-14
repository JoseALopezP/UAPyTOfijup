'use client'
import { DataContextProvider } from "@/context/DataContext";
export default function Admin() {
    return (
      <>
          <DataContextProvider>
          </DataContextProvider>
      </>
    )
}