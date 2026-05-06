'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
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
