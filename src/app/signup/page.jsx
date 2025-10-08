'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import { SignUpBlock } from "./components/SignUpBlock";

export default function Page() {
    return (
      <>
        <AuthContextProvider>
        <DataContextProvider>
            <SignUpBlock/>
        </DataContextProvider>
        </AuthContextProvider>
      </>
    )
}