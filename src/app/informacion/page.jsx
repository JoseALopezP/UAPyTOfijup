import { BlockCarga } from './components/blockCarga'
import { BlockList } from './components/blockList'
import styles from './components/informacion.module.css'
export default function Informacion() {
    return (
      <div className={`${styles.informacionBlock}`}>
        <BlockList/>
        <BlockCarga/>
      </div>
    )
}