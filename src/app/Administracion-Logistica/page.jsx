'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';
import DownloadXLSXInforme from './modules/DownloadXLSXInforme';
import ImportantDates from './modules/ImportantDates';
import BloqueoMasivo from './modules/BloqueoMasivo';
import MigrationPanel from './modules/MigrationPanel';
import SyncPanel from './modules/SyncPanel';
import PatchAudienceData from './modules/PatchAudienceData';
import renameDocument from '@/firebase new/firestore/renameDocument';

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
          <div className={`${styles.container}`}>
            <MigrationPanel />
          </div>
          <div className={`${styles.container}`}>
            <SyncPanel />
          </div>
          <div className={`${styles.container}`}>
            <PatchAudienceData />
          </div>
          <div className={`${styles.container}`}>
            <button className={`${styles.button}`} onClick={() => renameDocument()}>POR FAVOR NO TOCAR</button>
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}