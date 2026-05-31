import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Header /> 
      
      <main className="flex-1 pt-16 pb-24 px-4 animate-in fade-in duration-300">
        {children}
      </main>
      
      <Footer /> 
    </div>
  );
}