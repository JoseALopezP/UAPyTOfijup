'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import MenuSelector from './components/MenuSelector'
import { DataContextProvider } from "@/context New/DataContext";
import MenuImportantDates from './components/MenuImportantDates'
import styles from './Menu.module.css'

export default function menu() {
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <container className={`${styles.menuContainer}`}>
            <MenuSelector />
            <MenuImportantDates />
          </container>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}