'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import SelectBar from './components/SelectBar';
import { useState } from "react";

export default function menu() {
    const [selectedList, setSelectedList] = useState([])
    return (
      <>
      <AuthContextProvider>
        <DataContextProvider>
            <SelectBar selectedList={selectedList} setSelectedList={setSelectedList}/>
        </DataContextProvider>
      </AuthContextProvider>
      </>
    )
}