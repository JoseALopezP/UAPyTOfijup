'use client'
import { AuthContextProvider } from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import SignIn from "./components/signin";

export default function Home() {
  return (
    <AuthContextProvider>
        <DataContextProvider>
        <main>
            <SignIn/>
        </main>
      </DataContextProvider>
    </AuthContextProvider>
  );
}