'use client'
import { useState } from 'react'
import styles from '../RegistroAudiencia.module.css';

export default function RegistroNavBar({ navbarList, selectedTab, setSelectedTab, needsSaving, onSave, isSaving }) {

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

      {/* Botón de Guardado Unificado */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || !needsSaving}
        className={isSaving 
          ? `${styles.saveBtn} ${styles.saveBtnSaving}` 
          : needsSaving 
            ? `${styles.saveBtn} ${styles.saveBtnUnsaved}` 
            : `${styles.saveBtn} ${styles.saveBtnSaved}`
        }
      >
        <span className={styles.saveIcon}>
          {isSaving ? '⏳' : needsSaving ? '' : '✅'}
        </span>
        <span className={styles.saveText}>
          {isSaving ? 'Guardando...' : needsSaving ? 'Guardar Cambios' : 'Guardado'}
        </span>
      </button>
    </div>
  )
}