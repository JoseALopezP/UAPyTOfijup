'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
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