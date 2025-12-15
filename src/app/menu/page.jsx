'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import MenuSelector from './components/MenuSelector'
import { DataContextProvider } from "@/context New/DataContext";
import MenuImportantDates from './components/MenuImportantDates'
import styles from './Menu.module.css'

export default function Menu() {
  console.log(styles);
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <div className={`${styles.menuContainer}`}>
            <MenuSelector />
            <MenuImportantDates />
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  )
}