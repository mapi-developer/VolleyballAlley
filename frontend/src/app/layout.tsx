import { UserProvider } from "@/context/UserContext";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col pt-16 pb-24 bg-zinc-50">
        <UserProvider>
          <Header /> 
          <main className="flex-1 px-4">{children}</main>
          <Footer isOrganizer={true} />
        </UserProvider>
      </body>
    </html>
  );
}