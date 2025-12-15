'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import Menu from "./menu/page";

export default function menu() {
  return (
    <AuthContextProvider>
      <DataContextProvider>
        <Menu />
      </DataContextProvider>
    </AuthContextProvider>
  )
}