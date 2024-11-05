'use client'
import styles from './Oficios.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";

export default function page() {
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <div className={styles.container}>

          </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}