import { interTight, jetbrainsMono, instrumentSerif, inter, playfairDisplay, publicSans, bebasNeue, spaceMono, urbanist, archivoBlack, archivo, spaceGrotesk, albertSans, plusJakartaSans } from "@/lib/fonts";
import "./globals.css";
import "./kks-theme.css";
import "../components/menu/menu.css";
import "../components/hero/hero.css";
import "../components/about/about.css";
import "../components/about/liquid-ether.css";
import "../components/stats/stats.css";
import Header from "@/components/header/Header";
import Cursor from "@/components/Cursor";
import Menu from "@/components/menu/Menu";
import { MenuProvider } from "@/components/menu/MenuContext";
import SmoothScroll from "@/lib/SmoothScroll";
import SectionReveal from "@/lib/SectionReveal";
import Preloader from "@/components/fx/Preloader";
import ScrollHUD from "@/components/fx/ScrollHUD";
import EasterEgg from "@/components/fx/EasterEgg";

export const metadata = {
  title: "Krishna Kant Singh — Creative Developer",
  description:
    "Creative developer designing and engineering immersive web experiences — WebGL, motion design and pixel-true interfaces.",
  openGraph: {
    title: "Krishna Kant Singh — Creative Developer",
    description: "WebGL, motion design and pixel-true interfaces. Selected work, process and contact.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krishna Kant Singh — Creative Developer",
    description: "WebGL, motion design and pixel-true interfaces.",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${inter.variable} ${playfairDisplay.variable} ${publicSans.variable} ${bebasNeue.variable} ${spaceMono.variable} ${urbanist.variable} ${archivoBlack.variable} ${archivo.variable} ${spaceGrotesk.variable} ${albertSans.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before paint: skip the loader instantly on repeat visits (no flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('kks-seen')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans cursor-none" suppressHydrationWarning>
        <SmoothScroll />
        <SectionReveal />
        <Preloader />
        <MenuProvider>
          <Cursor />
          <ScrollHUD />
          <EasterEgg />
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
