'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from '../Menu.module.css'
import RAE_LIST from './diccionario_rae_5.json'
import WORD_LIST from './diccionario_palabras.json'

const KEYBOARD_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
];

export default function Wordle() {
    const [completedGuesses, setCompletedGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [targetWord, setTargetWord] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [dateString, setDateString] = useState('');

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 2500);
    };

    // 1. Cargar estado
    useEffect(() => {
        const today = new Date().toDateString();
        const savedState = localStorage.getItem('wordleGameState');
        let wordOfDay = '';

        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.date === today && parsed.targetWord) {
                    setCompletedGuesses(parsed.completedGuesses || []);
                    setGameOver(parsed.gameOver || false);
                    wordOfDay = parsed.targetWord; // Reusar la misma palabra aleatoria si ya se habia generado hoy
                }
            } catch (error) {
                console.error("Error al leer localStorage:", error);
            }
        }

        if (!wordOfDay) {
            // Seleccionar "al azar" estricto de diccionario_palabras.json
            const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
            wordOfDay = WORD_LIST[randomIndex].toLowerCase();
        }

        setTargetWord(wordOfDay);
        setDateString(today);
        setLoading(false);
    }, []);

    // 2. Guardar estado
    useEffect(() => {
        if (loading || !dateString || !targetWord) return;
        const stateToSave = {
            date: dateString,
            targetWord,
            completedGuesses,
            gameOver
        };
        localStorage.setItem('wordleGameState', JSON.stringify(stateToSave));
    }, [completedGuesses, gameOver, targetWord, dateString, loading]);
    const getColors = (guess, target) => {
        const statuses = Array(5).fill('Absent');
        const targetCounts = {};
        for (const char of target) {
            targetCounts[char] = (targetCounts[char] || 0) + 1;
        }
        for (let i = 0; i < 5; i++) {
            if (guess[i] === target[i]) {
                statuses[i] = 'Correct';
                targetCounts[guess[i]] -= 1;
            }
        }
        for (let i = 0; i < 5; i++) {
            if (guess[i] !== target[i] && targetCounts[guess[i]] > 0) {
                statuses[i] = 'Present';
                targetCounts[guess[i]] -= 1;
            }
        }
        return statuses;
    };

    const onKeyPress = useCallback((key) => {
        if (gameOver || loading) return;

        if (key === 'Enter') {
            if (currentGuess.length !== 5) {
                showMessage('Faltan letras');
                return;
            }
            if (!RAE_LIST.includes(currentGuess) && !WORD_LIST.includes(currentGuess)) {
                showMessage('No está en el diccionario');
                return;
            }

            const newGuesses = [...completedGuesses, currentGuess];
            setCompletedGuesses(newGuesses);
            setCurrentGuess('');

            if (currentGuess === targetWord) {
                setGameOver(true);
                showMessage('¡Ganaste!');
            } else if (newGuesses.length === 6) {
                setGameOver(true);
                showMessage(`Fin. La palabra era: ${targetWord.toUpperCase()}`);
            }
        } else if (key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[a-zñ]$/i.test(key)) {
            if (currentGuess.length < 5) {
                setCurrentGuess(prev => prev + key.toLowerCase());
            }
        }
    }, [currentGuess, completedGuesses, gameOver, loading, targetWord]);

    // Evento de teclado físico
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            let key = e.key;
            if (key === 'Enter' || key === 'Backspace' || /^[a-zA-ZñÑ]$/.test(key)) {
                onKeyPress(key === 'Backspace' || key === 'Enter' ? key : key.toLowerCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onKeyPress]);

    // Calcular colores del teclado
    const keyboardStatuses = {};
    completedGuesses.forEach(guess => {
        const statuses = getColors(guess, targetWord);
        for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            const status = statuses[i];
            const current = keyboardStatuses[letter];
            if (status === 'Correct') {
                keyboardStatuses[letter] = 'Correct'; // green priority
            } else if (status === 'Present' && current !== 'Correct') {
                keyboardStatuses[letter] = 'Present'; // yellow
            } else if (!current) {
                keyboardStatuses[letter] = 'Absent'; // gray
            }
        }
    });

    const startNewGame = () => {
        const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
        const newWord = WORD_LIST[randomIndex].toLowerCase();

        setTargetWord(newWord);
        setCompletedGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setMessage('');

        const stateToSave = {
            date: dateString,
            targetWord: newWord,
            completedGuesses: [],
            gameOver: false
        };
        localStorage.setItem('wordleGameState', JSON.stringify(stateToSave));
    };

    if (loading) return null;

    return (
        <div className={`${styles.importantDatesSection} ${styles.wordleContainer}`}>
            <div className={styles.wordleHeader}>
                <h3>WORDLE</h3>
                <button
                    onClick={startNewGame}
                    className={`${styles.linkRedirection} ${styles.wordleRestartBtn}`}
                >
                    ↻ Nueva Palabra
                </button>
            </div>

            {message && (
                <div className={styles.wordleMessage}>
                    {message}
                </div>
            )}

            {/* GRILLA */}
            <div className={styles.wordleGrid}>
                {Array.from({ length: 6 }).map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === completedGuesses.length;
                    const guess = isCurrentRow ? currentGuess : completedGuesses[rowIndex] || '';
                    const statuses = rowIndex < completedGuesses.length ? getColors(guess, targetWord) : Array(5).fill('');

                    return (
                        <div key={rowIndex} className={styles.wordleRow}>
                            {Array.from({ length: 5 }).map((_, colIndex) => {
                                const letter = guess[colIndex] || '';
                                const status = statuses[colIndex] || '';
                                const isFilled = letter && status === '';

                                let cellClass = styles.wordleCell;
                                if (isFilled) cellClass += ` ${styles.wordleCellFilled}`;
                                if (status === 'Correct') cellClass += ` ${styles.wordleCellCorrect}`;
                                if (status === 'Present') cellClass += ` ${styles.wordleCellPresent}`;
                                if (status === 'Absent') cellClass += ` ${styles.wordleCellAbsent}`;

                                return (
                                    <div key={colIndex} className={cellClass}>
                                        {letter}
                                    </div>
                                )
                            })}
                        </div>
                    );
                })}
            </div>

            {/* TECLADO */}
            <div className={styles.wordleKeyboard}>
                {KEYBOARD_ROWS.map((row, i) => (
                    <div key={i} className={styles.wordleKeyRow}>
                        {row.map(key => {
                            const isAction = key === 'Enter' || key === 'Backspace';
                            const status = keyboardStatuses[key] || '';

                            let keyClass = styles.wordleKey;
                            if (isAction) keyClass += ` ${styles.wordleKeyAction}`;
                            if (status === 'Correct') keyClass += ` ${styles.wordleKeyCorrect}`;
                            if (status === 'Present') keyClass += ` ${styles.wordleKeyPresent}`;
                            if (status === 'Absent') keyClass += ` ${styles.wordleKeyAbsent}`;

                            return (
                                <button
                                    key={key}
                                    onClick={() => onKeyPress(key)}
                                    className={keyClass}
                                >
                                    {key === 'Backspace' ? '⌫' : key}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}