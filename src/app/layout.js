import { inter, playfairDisplay, publicSans, bebasNeue, spaceMono, urbanist, archivoBlack, archivo, spaceGrotesk, albertSans } from "@/lib/fonts";
import "./globals.css";
import "../components/menu/menu.css";
import "../components/hero/hero.css";
import "../components/about/about.css";
import "../components/about/liquid-ether.css";
import Header from "@/components/header/Header";
import Cursor from "@/components/Cursor";
import Menu from "@/components/menu/Menu";
import { MenuProvider } from "@/components/menu/MenuContext";
import SmoothScroll from "@/lib/SmoothScroll";
import SectionReveal from "@/lib/SectionReveal";

export const metadata = {
  title: "Krishna Kant Singh | Creative Developer",
  description: "Top 5% Creative Developer Portfolio showcasing WebGL, Motion Design, and Immersive Experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${publicSans.variable} ${bebasNeue.variable} ${spaceMono.variable} ${urbanist.variable} ${archivoBlack.variable} ${archivo.variable} ${spaceGrotesk.variable} ${albertSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans cursor-none">
        <SmoothScroll />
        <SectionReveal />
        <MenuProvider>
          <Cursor />
          <Header />
          <Menu />
          <div id="smooth-wrapper">
            <div id="smooth-content">
              {children}
            </div>
          </div>
        </MenuProvider>
      </body>
    </html>
  );
}
