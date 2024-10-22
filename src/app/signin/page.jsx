'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import SignIn from "./components/signin";

export default function Home() {
  return (
    <main>
        <SignIn/>
    </main>
  );
}
