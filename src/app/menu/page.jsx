'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import MenuSelector from './components/MenuSelector'
import { DataContextProvider } from "@/context/DataContext";
import MenuImportantDates from './components/MenuImportantDates'
import Wordle from "./components/Wordle";
import styles from './Menu.module.css'

export default function Menu() {
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <div className={`${styles.menuContainer}`}>
            <div className={`${styles.menuListContainer}`}>
              <MenuSelector />
              <Wordle />
            </div>
            <MenuImportantDates />
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}
