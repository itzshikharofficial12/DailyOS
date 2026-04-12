import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import { AuthProvider } from "./AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-950">
        <AuthProvider>
          <KeyboardShortcutsProvider />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            {/* No overflow-auto, no padding — each page controls its own layout */}
            <main className="flex-1 min-w-0 overflow-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}