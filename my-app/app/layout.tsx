import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamReact2 · Рабочее пространство",
  description: "Макет рабочего пространства для проектов и задач.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="min-h-full antialiased">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-200">
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-lg focus:bg-cyan-300 focus:px-4 focus:py-2 focus:text-slate-950">
          Перейти к содержанию
        </a>
        {children}
      </body>
    </html>
  );
}
