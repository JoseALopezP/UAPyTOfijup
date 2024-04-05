'use client'
import signIn from "@/firebase/auth/signin";
import styles from './signin.module.css'
import { useState } from "react";
import { useRouter } from 'next/navigation'

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    
    const handleForm = async (event) => {
        event.preventDefault()
        const { result, error } = await signIn(email, password);
        if (error) {
            return console.log(error)
        }
        return router.push("/admin")
    }
    return (
        <section className={`${styles.signInSection}`}>
            <div className="form-wrapper">
                <h1 className="mt-60 mb-30">Iniciar sesión</h1>
                <form onSubmit={handleForm} className="form">
                    <label htmlFor="email">
                        <p>Correo Electrónico</p>
                        <input onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email" placeholder="ejemplo@mail.com" />
                    </label>
                    <label htmlFor="password">
                        <p>Contraseña</p>
                        <input onChange={(e) => setPassword(e.target.value)} required type="password" name="password" id="password" placeholder="contraseña" />
                    </label>
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </section>
    );
}