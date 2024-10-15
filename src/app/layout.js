import "./globals.css";
import NavBar from "./navBar/NavBar";
import { titillium } from "./ui/fonts";

export const metadata = {
  title: "OFIJUPenal",
  description: "Tablero de horarios Audiencias",
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={titillium.className}>
        <NavBar/>
        {children}
      </body>
    </html>
  );
}
