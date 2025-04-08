'use client'
import styles from './ControlUac.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import TableHead from './components/TableHead';

export default function page(){
    return (
      <AuthContextProvider>
        <DataContextProvider>
            <div className={`${styles.tableControlUac}`}>
                <TableHead />
            </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}