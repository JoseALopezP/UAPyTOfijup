'use client'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import SelectBar from './components/SelectBar';
import { useState } from "react";
import EditBlock from "./components/EditBlock";

function MinutaJuicioContent() {
    const [selectedList, setSelectedList] = useState([])
    return (
        <>
            <SelectBar selectedList={selectedList} setSelectedList={setSelectedList}/>
            <EditBlock selectedList={selectedList} />
        </>
    )
}

export default function Page() {
    return (
      <AuthContextProvider>
        <DataContextProvider>
            <MinutaJuicioContent />
        </DataContextProvider>
      </AuthContextProvider>
    )
}