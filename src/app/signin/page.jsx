'use client'
import { AuthContextProvider } from "@/context/AuthContext";
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