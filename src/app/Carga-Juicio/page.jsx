'use client'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import JuicioFrame from './components/JuicioFrame';

export default function page(){
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <JuicioFrame />
        </DataContextProvider>
      </AuthContextProvider>
    )
}