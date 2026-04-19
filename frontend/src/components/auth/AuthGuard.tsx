"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 공개 페이지 리스트 (홈, 로그인 안내 페이지)
    const publicPaths = ["/", "/auth/login-required"];
    
    // 만약 현재 경로가 공개 페이지라면 체크하지 않음
    if (publicPaths.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      // 토큰이 없으면 로그인 안내 페이지로 리다이렉트
      router.push("/auth/login-required");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // 체크 중일 때는 하얀 화면이나 로딩 스피너를 보여줄 수 있음 (깜빡임 방지)
  if (isChecking && !["/", "/auth/login-required"].includes(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
