import {
  Public_Sans,
  Inclusive_Sans,
  Plus_Jakarta_Sans,
  Bebas_Neue,
  Archivo_Black,
  Archivo,
  Space_Grotesk,
  Albert_Sans,
  Lato,
  Inter,
  Urbanist,
  Playfair_Display,
  Space_Mono,
} from 'next/font/google';

export const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans' });
export const inclusiveSans = Inclusive_Sans({ weight: ['400'], subsets: ['latin'], variable: '--font-inclusive-sans' });
export const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans' });
export const bebasNeue = Bebas_Neue({ weight: ['400'], subsets: ['latin'], variable: '--font-bebas-neue' });
export const archivoBlack = Archivo_Black({ weight: ['400'], subsets: ['latin'], variable: '--font-archivo-black' });
export const archivo = Archivo({ weight: ['500', '600', '700', '800'], subsets: ['latin'], variable: '--font-archivo' });
export const spaceGrotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-aeonik' });
export const albertSans = Albert_Sans({ subsets: ['latin'], variable: '--font-albert-sans' });
export const lato = Lato({ weight: ['100', '300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato' });
export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
export const urbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist' });
export const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });
export const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' });
