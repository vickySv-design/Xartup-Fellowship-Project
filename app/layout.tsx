import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ToastContainer from "@/components/Toast";

export const metadata: Metadata = {
  title: "VC Intel - Thesis-First Startup Intelligence",
  description: "Explainable AI enrichment for venture capital scouting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
        <ToastContainer />
        
        {/* Keyboard shortcuts hint */}
        <div className="fixed bottom-4 left-4 text-xs text-gray-600 bg-gray-900/50 px-3 py-2 rounded border border-gray-800 backdrop-blur-sm">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">/</kbd> to search
        </div>
      </body>
    </html>
  );
}
