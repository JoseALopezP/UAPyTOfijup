'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';

export default function page() {
    return (
      <>
      <AuthContextProvider>
        <DataContextProvider>
            <div className={`${styles.container}`}>
              <DownloadXLSX />
            </div>
        </DataContextProvider>
      </AuthContextProvider>
      </>
    )
}