'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';
import DownloadXLSXInforme from './modules/DownloadXLSXInforme';
import renameDocument from '@/firebase/firestore/renameDocument';

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
            <div className={`${styles.container}`}>
              <button className={`${styles.button}`} onClick={() => renameDocument()}>POR FAVOR NO TOCAR</button>
            </div>
        </DataContextProvider>
      </AuthContextProvider>
      </>
    )
}