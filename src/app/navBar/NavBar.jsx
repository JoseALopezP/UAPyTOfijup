'use client'
import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    return (
        <div className={[styles.container]}>
            <span className={[styles.subcontainer]}><IconNavBar iconRoute={''}/>
            <IconNavBar iconRoute={'tablero'}/>
            <IconNavBar iconRoute={'Agregar-Audiencia'}/>
            <IconNavBar iconRoute={'Registro-Audiencia'}/>
            <IconNavBar iconRoute={'Sorteo-Operador'}/>
            <IconNavBar iconRoute={'Oficios'}/>
            <IconNavBar iconRoute={'Situacion-Corporal'}/></span>
            <span className={[styles.subcontainer]}>
                <IconNavBar iconRoute={'Administracion-Logistica'}/>
                <IconNavBar iconRoute={'Listas-Desplegables'}/>
                <IconNavBar iconRoute={'Manual'}/></span>
        </div>
    );
}
