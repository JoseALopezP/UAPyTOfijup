'use client'
import { useState, useEffect } from 'react'
import styles from '../RegistroAudiencia.module.css';

const STORAGE_KEY = 'app-theme'

export default function RegistroNavBar({ navbarList, selectedTab, setSelectedTab }) {
  const [isLight, setIsLight] = useState(false)

  // Restaurar preferencia al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light') {
      setIsLight(true)
      document.body.classList.add('light-mode')
    }
  }, [])

  const toggleTheme = () => {
    const next = !isLight
    setIsLight(next)
    if (next) {
      document.body.classList.add('light-mode')
      localStorage.setItem(STORAGE_KEY, 'light')
    } else {
      document.body.classList.remove('light-mode')
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
  }

  return (
    <div className={styles.navBarBlock}>
      {/* Tabs de secciones */}
      {navbarList.map((el) => (
        <span
          key={el}
          onClick={() => setSelectedTab(el)}
          className={selectedTab === el
            ? `${styles.selectedTab} ${styles.tab}`
            : styles.tab}
        >
          <p>{el}</p>
        </span>
      ))}

      {/* Botón de tema — empujado a la derecha por margin-left: auto en CSS */}
      <button
        className={styles.themeToggleBtn}
        onClick={toggleTheme}
        title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        <span>{isLight ? '🌙' : '☀️'}</span>
        <span>{isLight ? 'Oscuro' : 'Claro'}</span>
      </button>
    </div>
  )
}