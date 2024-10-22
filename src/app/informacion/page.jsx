import { BlockCarga } from './components/BlockCarga'
import { BlockList } from './components/BlockList'
import styles from './components/informacion.module.css'
export default function Informacion() {
    return (
      <div className={`${styles.informacionBlock}`}>
        <BlockList/>
        <BlockCarga/>
      </div>
    )
}