import { Inter } from "next/font/google";
import "./globals.css";
import { titillium } from "./ui/fonts";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UAPyT",
  description: "Tablero de horarios Audiencias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={titillium.className}>{children}</body>
    </html>
  );
}
