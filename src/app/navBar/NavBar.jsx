'use client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { userRole, user } = useAuthContext();
    const scrollRef = useRef(null);
    const [showUpArrow, setShowUpArrow] = useState(false);
    const [showDownArrow, setShowDownArrow] = useState(false);

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

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            setShowUpArrow(scrollTop > 5);
            setShowDownArrow(scrollTop + clientHeight < scrollHeight - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        const timer = setTimeout(checkScroll, 300);

        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timer);
        };
    }, [user, userRole, pathname]);

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const amount = direction === 'up' ? -120 : 120;
            scrollRef.current.scrollBy({
                top: amount,
                behavior: 'smooth'
            });
        }
    };

    if (pathname === '/celular') {
        return null;
    }

    const hasAccess = (route) => {
        if (!user) return false;

        const publicRoutes = ['', 'tablero', 'Manual'];

        // Filter by build target (exclude pages not compiled in this build)
        const buildTarget = process.env.NEXT_PUBLIC_BUILD_TARGET;
        
        if (buildTarget === 'vercel' && route === 'Notificaciones') {
            return false;
        }

        if (buildTarget && buildTarget !== 'admin' && buildTarget !== 'vercel') {
            const targetAllowedRoutes = {
                unc: ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Solicitudes-Audiencia', 'Notificaciones', 'Situacion-Corporal'],
                uga: ['Agregar-Audiencia', 'Minuta-Juicio', 'Centro-UGA', 'Registro-Audiencia', 'Situacion-Corporal', 'Sorteo-Operador', 'Gestion-Usuarios'],
                ual: ['Pumba', 'tablero', 'Notificaciones', 'Gestion-Usuarios']
            };
            const allowed = targetAllowedRoutes[buildTarget];
            if (allowed && !allowed.includes(route) && !publicRoutes.includes(route)) {
                return false;
            }
        }

        if (publicRoutes.includes(route)) return true;

        if (!userRole) return false;
        
        const r = userRole.toLowerCase();
        if (r === 'admin' || r === 'ual') return true;

        if (r === 'uac' || r === 'unc') {
            const uacRoutes = ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Solicitudes-Audiencia', 'Notificaciones', 'Situacion-Corporal'];
            return uacRoutes.includes(route);
        }

        if (r === 'ugaadmin') {
            const ugaAdminRoutes = ['Agregar-Audiencia', 'Minuta-Juicio', 'Centro-UGA', 'Registro-Audiencia', 'Situacion-Corporal', 'Sorteo-Operador', 'Gestion-Usuarios'];
            return ugaAdminRoutes.includes(route);
        }

        if (r === 'uga') {
            const ugaRoutes = ['Agregar-Audiencia', 'Minuta-Juicio', 'Centro-UGA', 'Registro-Audiencia', 'Situacion-Corporal', 'Sorteo-Operador'];
            return ugaRoutes.includes(route);
        }

        return false;
    };

    return (
        <div className={styles.container}>
            {hasAccess('') && (
                <div className={styles.topLogo}>
                    <IconNavBar iconRoute={''} />
                </div>
            )}
            
            <div className={styles.scrollWrapper}>
                {showUpArrow && (
                    <button className={styles.scrollArrow} onClick={() => handleScroll('up')}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12 8.5L6 14.5L7.4 15.9L12 11.3L16.6 15.9L18 14.5L12 8.5Z" />
                        </svg>
                    </button>
                )}
                
                <div 
                    ref={scrollRef} 
                    className={styles.scrollableMiddle}
                    onScroll={checkScroll}
                >
                    {hasAccess('tablero') && <IconNavBar iconRoute={'tablero'} />}
                    <div className={styles.separator} />
                    {hasAccess('Agregar-Audiencia') && <IconNavBar iconRoute={'Agregar-Audiencia'} />}
                    {hasAccess('Carga-Juicio') && <IconNavBar iconRoute={'Carga-Juicio'} />}
                    {hasAccess('Oficios') && <IconNavBar iconRoute={'Oficios'} />}
                    {hasAccess('audienciasUAC/control') && <IconNavBar iconRoute={'audienciasUAC/control'} />}
                    {hasAccess('Solicitudes-Audiencia') && <IconNavBar iconRoute={'Solicitudes-Audiencia'} />}
                    <div className={styles.separator} />
                    {hasAccess('Registro-Audiencia') && <IconNavBar iconRoute={'Registro-Audiencia'} />}
                    {hasAccess('Minuta-Juicio') && <IconNavBar iconRoute={'Minuta-Juicio'} />}
                    {hasAccess('Centro-UGA') && <IconNavBar iconRoute={'Centro-UGA'} />}
                    {hasAccess('Sorteo-Operador') && <IconNavBar iconRoute={'Sorteo-Operador'} />}
                    <div className={styles.separator} />
                    {hasAccess('Situacion-Corporal') && <IconNavBar iconRoute={'Situacion-Corporal'} />}
                </div>

                {showDownArrow && (
                    <button className={styles.scrollArrow} onClick={() => handleScroll('down')}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12 15.5L18 9.5L16.6 8.1L12 12.7L7.4 8.1L6 9.5L12 15.5Z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className={styles.bottomWrapper}>
                {hasAccess('Administracion-Logistica') && <IconNavBar iconRoute={'Administracion-Logistica'} />}
                {hasAccess('Pumba') && <IconNavBar iconRoute={'Pumba'} />}
                {hasAccess('Abogados') && <IconNavBar iconRoute={'Abogados'} />}
                {hasAccess('Listas-Desplegables') && <IconNavBar iconRoute={'Listas-Desplegables'} />}
                {hasAccess('Notificaciones') && <IconNavBar iconRoute={'Notificaciones'} />}
                {hasAccess('Gestion-Usuarios') && <IconNavBar iconRoute={'Gestion-Usuarios'} />}
                {hasAccess('Manual') && <IconNavBar iconRoute={'Manual'} />}
            </div>
        </div>
    );
}
