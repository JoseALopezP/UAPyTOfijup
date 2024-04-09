import "./globals.css";
import { titillium } from "./ui/fonts";

export const metadata = {
  title: "UAPyT",
  description: "Tablero de horarios Audiencias",
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={titillium.className}>{children}</body>
    </html>
  );
}
