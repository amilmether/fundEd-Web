import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code-pro' });

export const metadata: Metadata = {
  title: 'FundEd | Class Fund and Event Management',
  description: 'A full-stack Next.js web app for class fund and event management.',
  manifest: '/manifest.json',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path fill=%22%2316a34a%22 d=%22M50,2L2,25L50,48L98,25L50,2Z%22/><path fill=%22%2315803d%22 d=%22M2,75L50,98L98,75L50,52L2,75Z%22/><path fill=%22%2314532d%22 d=%22M2,50L50,73L98,50L50,27L2,50Z%22/></svg>',
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
