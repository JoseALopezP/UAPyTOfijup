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
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        setIsLight(document.body.classList.contains('light-mode'));
    }, []);

    const toggleTheme = () => {
        const next = !isLight;
        setIsLight(next);
        if (next) {
            document.body.classList.add('light-mode');
            localStorage.setItem('app-theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('app-theme', 'dark');
        }
    };

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
                unc: ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Control-UAC', 'Solicitudes-Audiencia', 'Notificaciones', 'Situacion-Corporal', 'Abogados'],
                uga: ['Agregar-Audiencia', 'Centro-UGA', 'Registro-Audiencia', 'Sorteo-Operador', 'Gestion-Usuarios', 'Abogados'],
                ual: ['Pumba', 'tablero', 'Notificaciones', 'Gestion-Usuarios', 'Abogados']
            };
            const allowed = targetAllowedRoutes[buildTarget];
            if (allowed && !allowed.includes(route) && !publicRoutes.includes(route)) {
                return false;
            }
        }

        if (publicRoutes.includes(route)) return true;

        if (!userRole) return true; // Lax default during loading or if role is missing

        const r = typeof userRole === 'string' ? userRole.toLowerCase() : '';
        if (!r) return true;

        if (r === 'admin' || r === 'ual') return true;

        if (r === 'uac' || r === 'unc') {
            const uacRoutes = ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Control-UAC', 'Solicitudes-Audiencia', 'Notificaciones', 'Situacion-Corporal'];
            return uacRoutes.includes(route);
        }

        if (r === 'ugaadmin' || r === 'uga' || r === 'operador') {
            const ugaRoutes = ['Agregar-Audiencia', 'Centro-UGA', 'Registro-Audiencia', 'Sorteo-Operador'];
            return ugaRoutes.includes(route);
        }

        return true; // Lax fallback for unrecognized roles (e.g. operador, uapyt)
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
                    {hasAccess('Control-UAC') && <IconNavBar iconRoute={'Control-UAC'} />}
                    {hasAccess('Solicitudes-Audiencia') && <IconNavBar iconRoute={'Solicitudes-Audiencia'} />}
                    <div className={styles.separator} />
                    {hasAccess('Registro-Audiencia') && <IconNavBar iconRoute={'Registro-Audiencia'} />}
                    {hasAccess('Minuta-Juicio') && <IconNavBar iconRoute={'Minuta-Juicio'} />}
                    {hasAccess('Centro-UGA') && <IconNavBar iconRoute={'Centro-UGA'} />}
                    {hasAccess('Sorteo-Operador') && <IconNavBar iconRoute={'Sorteo-Operador'} />}
                    <div className={styles.separator} />
                    {hasAccess('Situacion-Corporal') && <IconNavBar iconRoute={'Situacion-Corporal'} />}
                    {hasAccess('Notificaciones') && <IconNavBar iconRoute={'Notificaciones'} />}
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
                {hasAccess('Gestion-Usuarios') && <IconNavBar iconRoute={'Gestion-Usuarios'} />}
                {hasAccess('Manual') && <IconNavBar iconRoute={'Manual'} />}
                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    title={isLight ? 'Modo Oscuro' : 'Modo Claro'}
                >
                    {isLight ? (
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm-12.37 1.41a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM18.36 5.64a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
