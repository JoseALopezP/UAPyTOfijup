'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';
import DownloadXLSXInforme from './modules/DownloadXLSXInforme';
import ImportantDates from './modules/ImportantDates';
import BloqueoMasivo from './modules/BloqueoMasivo';

export default function page() {
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <div className={`${styles.container}`}>
            <DownloadXLSX />
          </div>
          <div className={`${styles.container}`}>
            <DownloadXLSXInforme />
          </div>
          <div className={`${styles.container}`}>
            <ImportantDates />
          </div>
          <div className={`${styles.container}`}>
            <BloqueoMasivo />
          </div>
          {/*<div className={`${styles.container}`}>
            <button className={`${styles.button}`} onClick={() => renameDocument()}>POR FAVOR NO TOCAR</button>
          </div>*/}
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}