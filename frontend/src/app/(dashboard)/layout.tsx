"use client"

import SliderLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SliderLayout>
            {children}
        </SliderLayout>
    );
};