'use client'
import { useEffect, useContext, useState } from 'react'
import styles from '../administracionLogistica.module.css'
import { DataContext } from '@/context/DataContext'
import customDigitSort from '@/utils/sortDates'

export default function ImportantDates() {
    const { importantDates, updateImportantDates, saveImportantDatesList } = useContext(DataContext)
    const [dates, setDates] = useState({})
    const [newEntryKey, setNewEntryKey] = useState('')
    const [newEntryValue, setNewEntryValue] = useState('')
    const handleUpdateList = () => {
        saveImportantDatesList(dates)
    }
    const handleRenameCategory = (oldKey, newKey) => {
        if (!newKey || oldKey === newKey) return;
        const newDates = { ...dates };
        newDates[newKey] = newDates[oldKey];
        delete newDates[oldKey];
        setDates(newDates);
    }
    const handleDeleteCategory = (key) => {
        if (confirm(`Are you sure you want to delete category "${key}"?`)) {
            const newDates = { ...dates };
            delete newDates[key];
            setDates(newDates);
        }
    }
    const handleDeleteValue = (categoryKey, valueIndex) => {
        const newDates = { ...dates };
        newDates[categoryKey] = newDates[categoryKey].filter((_, index) => index !== valueIndex);
        setDates(newDates);
    }
    const handleEditValue = (categoryKey, valueIndex, newValue) => {
        const newDates = { ...dates };
        newDates[categoryKey] = [...newDates[categoryKey]];
        newDates[categoryKey][valueIndex] = newValue;
        setDates(newDates);
    }
    const handleUnifiedAdd = () => {
        if (!newEntryKey.trim() || !newEntryValue.trim()) return;
        const newDates = { ...dates };
        const key = newEntryKey.trim();
        const val = newEntryValue.trim();
        if (newDates[key]) {
            newDates[key] = [...newDates[key], val];
        } else {
            newDates[key] = [val];
        }

        setDates(newDates);
        setNewEntryKey('');
        setNewEntryValue('');
    }
    const handleKeyInputChange = (e) => {
        const val = e.target.value;
        setNewEntryKey(val);
    }
    useEffect(() => {
        if (importantDates && !Array.isArray(importantDates)) {
            setDates(importantDates)
        } else {
            setDates({})
        }
    }, [importantDates])
    useEffect(() => {
        updateImportantDates()
    }, [])
    return (
        <>
            <div className={`${styles.importantDatesContainer}`}>
                <div style={{ marginBottom: '20px', padding: '16px', background: '#1c1c24', borderRadius: '10px', border: '1px solid #2B2B2B' }}>
                    <span className={`${styles.titleSaveSpan}`}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: 600 }}>Fechas Especiales:</h3>
                        <button 
                            onClick={() => handleUpdateList()} 
                            className={`${styles.saveDateButton}`}
                            style={{ 
                                background: '#166534', 
                                border: 'none', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '6px',
                                fontSize: '16px',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            title="Guardar Cambios"
                        >
                            💾
                        </button>
                    </span>
                    <div className={`${styles.addDateBlock}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div className={`${styles.addDateInput}`} style={{ flex: 1 }}>
                            <input
                                placeholder="DDMM"
                                value={newEntryKey}
                                onChange={handleKeyInputChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px 10px', 
                                    background: '#111115', 
                                    color: '#ffffff', 
                                    border: '1px solid #2B2B2B', 
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                {dates && customDigitSort(Object.keys(dates)).map(key => <option key={key} value={key} />)}
                            </datalist>
                        </div>
                        <div className={`${styles.addValueInput}`} style={{ flex: 2 }}>
                            <input
                                placeholder="Nombre del día"
                                value={newEntryValue}
                                onChange={(e) => setNewEntryValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnifiedAdd()}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px 10px', 
                                    background: '#111115', 
                                    color: '#ffffff', 
                                    border: '1px solid #2B2B2B', 
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <button 
                            onClick={handleUnifiedAdd} 
                            style={{ 
                                padding: '8px 16px', 
                                background: '#1d4ed8', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className={`${styles.iDList}`}>
                    {dates && customDigitSort(Object.entries(dates)).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '1rem', border: '1px solid #2B2B2B', background: '#1c1c24', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <input
                                    value={key}
                                    onChange={(e) => handleRenameCategory(key, e.target.value)}
                                    style={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '0.95rem', 
                                        padding: '4px 8px', 
                                        background: '#111115', 
                                        color: '#f59e0b', 
                                        border: '1px solid #2B2B2B', 
                                        borderRadius: '6px', 
                                        flex: 1,
                                        outline: 'none'
                                    }}
                                />
                                <button onClick={() => handleDeleteCategory(key)} title="Eliminar Categoría" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                            </div>

                            {value && Array.isArray(value) && value.map((el, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', marginBottom: '6px' }}>
                                    <input
                                        value={el}
                                        onChange={(e) => handleEditValue(key, index, e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '4px 8px', 
                                            background: '#111115', 
                                            color: '#e2e8f0', 
                                            border: '1px solid #2B2B2B', 
                                            borderRadius: '4px',
                                            outline: 'none',
                                            fontSize: '13px'
                                        }}
                                    />
                                    <button onClick={() => handleDeleteValue(key, index)} title="Eliminar Entrada" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>❌</button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
