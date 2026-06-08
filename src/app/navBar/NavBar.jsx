'use client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { userRole, user } = useAuthContext();

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
                unc: ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Solicitudes-Audiencia', 'Notificaciones'],
                uga: ['Agregar-Audiencia', 'Minuta-Juicio', 'Centro-UGA', 'Registro-Audiencia', 'Situacion-Corporal'],
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

        if (r === 'uac') {
            const uacRoutes = ['Agregar-Audiencia', 'Carga-Juicio', 'Oficios', 'audienciasUAC/control', 'Solicitudes-Audiencia', 'Notificaciones'];
            return uacRoutes.includes(route);
        }

        if (r === 'ugaadmin' || r === 'uga') {
            const ugaRoutes = ['Agregar-Audiencia', 'Minuta-Juicio', 'Centro-UGA', 'Registro-Audiencia', 'Situacion-Corporal'];
            return ugaRoutes.includes(route);
        }

        return false;
    };

    return (
        <div className={[styles.container]}>
            <span className={[styles.subcontainer]}>
                {hasAccess('') && <IconNavBar iconRoute={''} />}
                {hasAccess('tablero') && <IconNavBar iconRoute={'tablero'} />}
                <p></p>
                {hasAccess('Agregar-Audiencia') && <IconNavBar iconRoute={'Agregar-Audiencia'} />}
                {hasAccess('Carga-Juicio') && <IconNavBar iconRoute={'Carga-Juicio'} />}
                {hasAccess('Oficios') && <IconNavBar iconRoute={'Oficios'} />}
                {hasAccess('audienciasUAC/control') && <IconNavBar iconRoute={'audienciasUAC/control'} />}
                {hasAccess('Solicitudes-Audiencia') && <IconNavBar iconRoute={'Solicitudes-Audiencia'} />}
                <p></p>
                {hasAccess('Registro-Audiencia') && <IconNavBar iconRoute={'Registro-Audiencia'} />}
                {hasAccess('Minuta-Juicio') && <IconNavBar iconRoute={'Minuta-Juicio'} />}
                {hasAccess('Centro-UGA') && <IconNavBar iconRoute={'Centro-UGA'} />}
                <p></p>
                {hasAccess('Situacion-Corporal') && <IconNavBar iconRoute={'Situacion-Corporal'} />}</span>
            <span className={[styles.subcontainer]}>
                {hasAccess('Administracion-Logistica') && <IconNavBar iconRoute={'Administracion-Logistica'} />}
                {hasAccess('Pumba') && <IconNavBar iconRoute={'Pumba'} />}
                {hasAccess('Abogados') && <IconNavBar iconRoute={'Abogados'} />}
                {hasAccess('Listas-Desplegables') && <IconNavBar iconRoute={'Listas-Desplegables'} />}
                {hasAccess('Notificaciones') && <IconNavBar iconRoute={'Notificaciones'} />}
                {hasAccess('Gestion-Usuarios') && <IconNavBar iconRoute={'Gestion-Usuarios'} />}
                {hasAccess('Manual') && <IconNavBar iconRoute={'Manual'} />}</span>
        </div>
    );
}
