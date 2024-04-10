import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'

export function InformationSection () {
    return(
        <section className={`${styles.infoSection}`}>
            <Clock/>
        </section>
    )
}