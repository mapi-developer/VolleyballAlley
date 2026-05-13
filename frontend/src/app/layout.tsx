import { UserProvider, UserRole } from "@/context/UserContext";
import { cookies } from "next/headers";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeSync from "@/components/ThemeSync";
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  
  // Read Role
  const initialRole = (cookieStore.get('dev-role')?.value as UserRole) || 'member';
  
  // Read User Data
  const userCookie = cookieStore.get('user-data')?.value;
  let initialUser = null;
  if (userCookie) {
    try {
      initialUser = JSON.parse(decodeURIComponent(userCookie));
    } catch (e) {
      initialUser = null;
    }
  }

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 overflow-x-hidden">
        <ThemeSync />
        <UserProvider initialRole={initialRole} initialUser={initialUser}>
          <Header /> 
          
          <main className="flex-1 pt-16 pb-24 px-4 animate-in fade-in duration-300">
            {children}
          </main>
          
          <Footer /> 
        </UserProvider>
      </body>
    </html>
  );
}