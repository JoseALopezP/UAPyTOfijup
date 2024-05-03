'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import MenuSelector from './components/MenuSelector'

export default function menu() {
    return (
      <>
      <AuthContextProvider>
        <MenuSelector/>
      </AuthContextProvider>
      </>
    )
}