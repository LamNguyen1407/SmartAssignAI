"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Suspense } from "react";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import Loading from "@/components/loading/Loading";

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

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
