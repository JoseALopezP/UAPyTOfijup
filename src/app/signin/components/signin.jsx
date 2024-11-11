"use client";

import signIn from "@/firebase/auth/signin";
import styles from './signin.module.css';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const errorMessages = {
    "auth/invalid-credential": "Credenciales inválidas",
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/too-many-requests": "Demasiados intentos. Inténtalo de nuevo más tarde.",
    "auth/network-request-failed": "Error de red. Verifica tu conexión.",
};

function translateError(error) {
    const errorCode = error?.code;
    return errorMessages[errorCode] || "Ocurrió un error. Inténtalo de nuevo.";
}

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clicked, setClicked] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleForm = async (event) => {
        event.preventDefault();
        const { result, error } = await signIn(email, password);
        if (error) {
            setErrorMessage(translateError(error));
            return;
        }
        setErrorMessage('');
        router.push("/");
    }

    return (
        <div className={`${styles.signinBody}`}>
            <section className={`${styles.signInSection}`}>
                <Image
                    className={`${styles.corteLogo}`}
                    src="/cortelogo.png"
                    width={227}
                    height={212}
                    alt="Logo Corte de Justicia"
                    priority={true}
                />
                <div className={`${styles.formWrapper}`}>
                    <h1>Iniciar sesión</h1>
                    <form onSubmit={handleForm} className={`${styles.formBlock}`}>
                        <label htmlFor="email" className={`${styles.labelSquare}`}>
                            <input className={`${styles.inputBlock}`} onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email" placeholder="ejemplo@mail.com" />
                        </label>
                        <label htmlFor="password" className={`${styles.labelSquare}`}>
                            <input className={`${styles.inputBlock}`} onChange={(e) => setPassword(e.target.value)} required type="password" name="password" id="password" placeholder="contraseña" />
                        </label>
                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                        <button type="submit" onClick={() => setClicked(!clicked)} className={clicked ? `${styles.loginButton} ${styles.loginButtonClicked}` : `${styles.loginButton}`}>
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
