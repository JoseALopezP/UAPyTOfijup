'use client'
import { useEffect, useContext, useState } from 'react'
import styles from '../administracionLogistica.module.css'
import { DataContext } from '@/context New/DataContext'

export default function ImportantDates() {
    const { importantDates, updateImportantDates } = useContext(DataContext)
    const [dates, setDates] = useState({})
    const [newEntryKey, setNewEntryKey] = useState('')
    const [newEntryValue, setNewEntryValue] = useState('')
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const handleUpdateList = () => {

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
        setFilteredSuggestions([]);
    }
    const handleKeyInputChange = (e) => {
        const val = e.target.value;
        setNewEntryKey(val);
        if (val.trim()) {
            const suggestions = Object.keys(dates).filter(key => key.toLowerCase().includes(val.toLowerCase()));
            setFilteredSuggestions(suggestions);
        } else {
            setFilteredSuggestions([]);
        }
    }
    useEffect(() => {
        setDates(importantDates)
    }, [importantDates])
    useEffect(() => {
        updateImportantDates()
    }, [])
    return (
        <>
            <div className={`${styles.importantDatesContainer}`}>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px', border: '1px solid #ddd' }}>
                    <span className={`${styles.titleSaveSpan}`}><h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Fechas importantes:</h3>
                        <button onClick={() => handleUpdateList()} className={`${styles.saveDateButton}`}>
                            💾
                        </button></span>
                    <div className={`${styles.addDateBlock}`}>
                        <div className={`${styles.addDateInput}`}>
                            <input
                                placeholder="Category Name (e.g. Feriados)"
                                value={newEntryKey}
                                onChange={handleKeyInputChange}
                                style={{ width: '100%', padding: '8px' }}
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                {dates && Object.keys(dates).map(key => <option key={key} value={key} />)}
                            </datalist>
                        </div>
                        <div className={`${styles.addValueInput}`}>
                            <input
                                placeholder="Value (e.g. 25 de Mayo)"
                                value={newEntryValue}
                                onChange={(e) => setNewEntryValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnifiedAdd()}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <button onClick={handleUnifiedAdd} style={{ padding: '8px 15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                            Add
                        </button>
                    </div>
                </div>

                <div className={`${styles.iDList}`}>
                    {dates && Object.entries(dates).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '1rem', border: '1px dashed #ccc', padding: '10px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                <input
                                    value={key}
                                    onChange={(e) => handleRenameCategory(key, e.target.value)}
                                    style={{ fontWeight: 'bold', fontSize: '1.1rem', padding: '5px', border: '1px solid #ddd', borderRadius: '3px', flex: 1 }}
                                />
                                <button onClick={() => handleDeleteCategory(key)} title="Delete Category" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                            </div>

                            {value && Array.isArray(value) && value.map((el, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px', marginBottom: '5px' }}>
                                    <input
                                        value={el}
                                        onChange={(e) => handleEditValue(key, index, e.target.value)}
                                        style={{ width: '100%', padding: '3px', border: '1px solid #eee', borderRadius: '3px' }}
                                    />
                                    <button onClick={() => handleDeleteValue(key, index)} title="Delete Entry" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}