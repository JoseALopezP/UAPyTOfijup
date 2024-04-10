import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './infoBlock'

export function InformationSection () {
    return(
        <section className={`${styles.infoSection}`}>
            <Clock/>
            <InfoBlock/>
        </section>
    )
}