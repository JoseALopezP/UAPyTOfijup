'use client'
import styles from './components/Carga-Juicio.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import AddJuicioInfo from './components/AddJuicioInfo';

export default function page(){
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <section className={`${styles.viewBlock}`}>
            <AddJuicioInfo />
          </section>
        </DataContextProvider>
      </AuthContextProvider>
    )
}