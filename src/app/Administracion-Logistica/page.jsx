'use client'
import styles from './administracionLogistica.module.css'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import DownloadXLSX from './modules/DownloadXLSX';
import DownloadXLSXInforme from './modules/DownloadXLSXInforme';
import ExtractorAnuladas from '@/app/Solicitudes-Audiencia/components/ExtractorAnuladas';
import ImportantDates from './modules/ImportantDates';
import BloqueoMasivo from './modules/BloqueoMasivo';
import MigrationPanel from './modules/MigrationPanel';
import SyncPanel from './modules/SyncPanel';
import PatchAudienceData from './modules/PatchAudienceData';
import renameDocument from '@/firebase/firestore/renameDocument';

export default function page() {
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <div className={styles.adminPageWrapper}>
            <div className={styles.adminGrid}>
              
              {/* Columna 1: Descargas y Extractor */}
              <div className={styles.column}>
                <DownloadXLSX />
                <DownloadXLSXInforme />
                <ExtractorAnuladas />
              </div>

              {/* Columna 2: Fechas Importantes */}
              <div className={styles.column}>
                <ImportantDates />
              </div>

              {/* Columna 3: Bloqueo Masivo y Sincronización */}
              <div className={styles.column}>
                <BloqueoMasivo />
                <SyncPanel />
              </div>

              {/* Columna 4: Migración e Inicializaciones */}
              <div className={styles.column}>
                <MigrationPanel />
                <PatchAudienceData />
                <div style={{ 
                  padding: '20px', 
                  background: '#111115', 
                  borderRadius: '12px', 
                  border: '1px solid #2B2B2B',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button 
                    className={`${styles.buttonxlsx}`} 
                    style={{ backgroundColor: '#b91c1c', marginTop: 0 }}
                    onClick={() => renameDocument()}
                  >
                    ⚠️ POR FAVOR NO TOCAR
                  </button>
                </div>
              </div>

            </div>
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}
