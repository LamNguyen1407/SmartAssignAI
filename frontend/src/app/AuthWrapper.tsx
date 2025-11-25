"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Suspense } from "react";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import Loading from "@/components/loading/Loading";
import { PublicPath } from "@/const/PublicPath";

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, user, loading } = useAuthStore();

    

  // Chạy checkAuth khi vào trang
  useEffect(() => {
    checkAuth();
  }, []);

  // Nếu chưa có user → bắt vào login (trừ trang public)
  useEffect(() => {
    if (loading) return;

    if (!user && !PublicPath.includes(pathname)) {
      router.push("/login");
    }
  }, [loading, user, pathname]);

  // Nếu đã login lại vào login/register → đẩy về dashboard
  useEffect(() => {
    if (loading) return;

    if (user && PublicPath.includes(pathname)) {
      router.push("/");
    }
  }, [loading, user, pathname]);

  if (loading) return <div>
    <Loading />
  </div>;

  return (
    <>
      <Suspense fallback={<div><Loading /></div>}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </Suspense>
      <ToastContainer position="top-right" />
    </>
  );
}
