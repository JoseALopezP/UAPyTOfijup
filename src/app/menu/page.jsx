'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import MenuSelector from './components/MenuSelector'
import { DataContextProvider } from "@/context/DataContext";

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