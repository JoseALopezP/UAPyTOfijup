import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    return (
        <div className={[styles.container]}>
            <IconNavBar iconRoute={''}/>
            <IconNavBar iconRoute={'Agregar-Audiencia'}/>
            <IconNavBar iconRoute={'Registro-Audiencia'}/>
            <IconNavBar iconRoute={'Sorteo-Operador'}/>
            <IconNavBar iconRoute={'Oficios'}/>
            <IconNavBar iconRoute={'Situación-Corporal'}/>
        </div>
    );
}
