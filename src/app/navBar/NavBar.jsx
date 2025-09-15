'use client'
import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    return (
        <div className={[styles.container]}>
            <span className={[styles.subcontainer]}>
            <IconNavBar iconRoute={''}/>
            <IconNavBar iconRoute={'tablero'}/>
                <p></p>
            <IconNavBar iconRoute={'Agregar-Audiencia'}/>
            <IconNavBar iconRoute={'Carga-Juicio'}/>
            <IconNavBar iconRoute={'Oficios'}/>
            <IconNavBar iconRoute={'audienciasUAC/control'}/>
                <p></p>
            <IconNavBar iconRoute={'Registro-Audiencia'}/>
            <IconNavBar iconRoute={'Minuta-Juicio'}/>
            <IconNavBar iconRoute={'Sorteo-Operador'}/>
                <p></p>
            <IconNavBar iconRoute={'Situacion-Corporal'}/></span>
            <span className={[styles.subcontainer]}>
                <IconNavBar iconRoute={'Administracion-Logistica'}/>
                <IconNavBar iconRoute={'Listas-Desplegables'}/>
                <IconNavBar iconRoute={'Manual'}/></span>
        </div>
    );
}
