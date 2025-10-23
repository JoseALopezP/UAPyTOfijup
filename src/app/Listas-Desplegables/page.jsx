'use client'
import { AuthContextProvider} from "@/context New/AuthContext";
import {DataContextProvider } from "@/context New/DataContext";
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