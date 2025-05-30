'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import MenuSelector from "./menu/components/MenuSelector";

export default function menu() {
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <MenuSelector/>
        </DataContextProvider>
      </AuthContextProvider>
    )
}