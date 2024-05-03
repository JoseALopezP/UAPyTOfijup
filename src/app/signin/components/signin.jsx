'use client'
import signIn from "@/firebase/auth/signin";
import styles from './signin.module.css'
import { useState } from "react";
import { useRouter } from 'next/navigation'
import Image from 'next/image'


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
        return router.push("/")
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
                        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" className={`${styles.loginIcon}`}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"/>
                        </svg>
                    </label>
                    <label htmlFor="password" className={`${styles.labelSquare}`}>
                        <input className={`${styles.inputBlock}`} onChange={(e) => setPassword(e.target.value)} required type="password" name="password" id="password" placeholder="contraseña" />
                        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" className={`${styles.loginIcon}`}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.75 8.25C9.75 7.00736 10.7574 6 12 6C13.2426 6 14.25 7.00736 14.25 8.25V9.75H9.75V8.25ZM8.25 9.75V8.25C8.25 6.17893 9.92893 4.5 12 4.5C14.0711 4.5 15.75 6.17893 15.75 8.25V9.75H17.25L18 10.5V18.75L17.25 19.5H6.75L6 18.75V10.5L6.75 9.75H8.25ZM7.5 18V11.25H16.5V18H7.5Z"/>
                        </svg>
                    </label>
                    <button type="submit" className={`${styles.loginButton}`}>Iniciar Sesión</button>
                </form>
            </div>
        </section>
        </div>
    );
}