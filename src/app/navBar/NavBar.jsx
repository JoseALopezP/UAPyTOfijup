'use client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
            const isPublicPage = pathname === '/signin' || pathname === '/signup';
            
            if (isMobile && pathname !== '/celular' && !isPublicPage) {
                router.push('/celular');
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [pathname, router]);

    if (pathname === '/celular') {
        return null;
    }

    return (
        <div className={[styles.container]}>
            <span className={[styles.subcontainer]}>
                <IconNavBar iconRoute={''} />
                <IconNavBar iconRoute={'tablero'} />
                <p></p>
                <IconNavBar iconRoute={'Agregar-Audiencia'} />
                <IconNavBar iconRoute={'Carga-Juicio'} />
                <IconNavBar iconRoute={'Oficios'} />
                <IconNavBar iconRoute={'audienciasUAC/control'} />
                <IconNavBar iconRoute={'Solicitudes-Audiencia'} />
                <p></p>
                <IconNavBar iconRoute={'Registro-Audiencia'} />
                <IconNavBar iconRoute={'Minuta-Juicio'} />
                <IconNavBar iconRoute={'Sorteo-Operador'} />
                <p></p>
                <IconNavBar iconRoute={'Situacion-Corporal'} /></span>
            <span className={[styles.subcontainer]}>
                <IconNavBar iconRoute={'Administracion-Logistica'} />
                <IconNavBar iconRoute={'Pumba'} />
                <IconNavBar iconRoute={'Abogados'} />
                <IconNavBar iconRoute={'Listas-Desplegables'} />

                <IconNavBar iconRoute={'Manual'} /></span>
        </div>
    );
}
