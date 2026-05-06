'use client'
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import Menu from "./menu/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function menu() {
  const router = useRouter();

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
      router.push('/celular');
    }
  }, [router]);

  return (
    <AuthContextProvider>
      <DataContextProvider>
        <Menu />
      </DataContextProvider>
    </AuthContextProvider>
  )
}
