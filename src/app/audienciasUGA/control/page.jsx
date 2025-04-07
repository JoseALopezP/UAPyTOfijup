'use client';
import { AuthContextProvider } from "@/context/AuthContext";
import { AudienciaAddList } from "../components/AudienciaAddList";
import { DataContextProvider } from "@/context/DataContext";

export default function Home() {
  return (
    <>
      <AuthContextProvider>
        <DataContextProvider>
          <AudienciaAddList/>
        </DataContextProvider>
      </AuthContextProvider>
    </>
  );
}