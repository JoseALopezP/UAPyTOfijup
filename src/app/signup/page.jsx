'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
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