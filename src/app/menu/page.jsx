'use client'
import { AuthContextProvider} from "@/context New/AuthContext";
import MenuSelector from './components/MenuSelector'
import { DataContextProvider } from "@/context New/DataContext";

export default function menu() {
    return (
      <>
      <AuthContextProvider>
        <DataContextProvider>
          <MenuSelector/>
        </DataContextProvider>
      </AuthContextProvider>
      </>
    )
}