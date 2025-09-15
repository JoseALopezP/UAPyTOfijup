'use client'
import styles from './components/Carga-Juicio.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";

export default function page(){
    return (
      <AuthContextProvider>
        <DataContextProvider>
        </DataContextProvider>
      </AuthContextProvider>
    )
}