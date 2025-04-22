'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';
import DownloadXLSXInforme from './modules/DownloadXLSXInforme';

export default function page() {
    return (
      <>
      <AuthContextProvider>
        <DataContextProvider>
            <div className={`${styles.container}`}>
              <DownloadXLSX />
            </div>
            <div className={`${styles.container}`}>
              <DownloadXLSXInforme/>
            </div>
        </DataContextProvider>
      </AuthContextProvider>
      </>
    )
}