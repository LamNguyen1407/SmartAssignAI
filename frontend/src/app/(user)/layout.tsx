"use client"

import Header from "@/components/Header";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 h-screen w-screen overflow-hidden">
            <Header />
            <main>
                {children}
            </main>
        </div>
    );
}