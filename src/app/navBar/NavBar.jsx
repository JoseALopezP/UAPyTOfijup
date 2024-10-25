import IconNavBar from './IconNavBar';
import styles from './NavBar.module.css'

export default function NavBar() {
    return (
        <container className={[styles.container]}>
            <IconNavBar iconRoute={''}/>
            <IconNavBar iconRoute={'Agregar-Audiencia'}/>
        </container>
    );
}
