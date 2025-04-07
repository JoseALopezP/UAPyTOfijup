'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";

export default function menu() {
    return (
      <AuthContextProvider>
        <DataContextProvider>
        </DataContextProvider>
      </AuthContextProvider>
    )
}