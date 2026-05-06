'use client'
import { AuthContextProvider} from "@/context/AuthContext";
import {DataContextProvider } from "@/context/DataContext";
import ContextWrapper from './modules/ContextWrapper';

export default function page() {
    return (
      <AuthContextProvider>
        <DataContextProvider>
            <ContextWrapper />
        </DataContextProvider>
      </AuthContextProvider>
    )
}
