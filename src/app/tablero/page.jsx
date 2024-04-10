import { InformationSection } from "./components/InformationSection";
import { ScheduleTable } from "./components/ScheduleTable";

export default function Tablero() {
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <>
        <InformationSection/>
        <ScheduleTable/>
      </>
    )
}