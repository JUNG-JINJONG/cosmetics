"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  ArrowLeft, 
  ChevronRight, 
  UserCircle2, 
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginRequiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center space-y-8 overflow-hidden">
          {/* Top Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse"></div>
              <div className="relative h-24 w-24 bg-gradient-to-br from-primary to-violet-600 rounded-3xl flex items-center justify-center shadow-lg rotate-3">
                <Lock className="h-12 w-12 text-white -rotate-3" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              로그인이 필요합니다
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xs mx-auto leading-relaxed">
              화장품 B2B 플랫폼의 프리미엄 서비스를 이용하시려면 로그인이 확인되어야 합니다.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-800">
              <UserCircle2 className="h-5 w-5 text-primary mb-2" />
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Buyer</div>
              <div className="text-sm font-semibold">브랜드사 의뢰 관리</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-800">
              <Sparkles className="h-5 w-5 text-amber-500 mb-2" />
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Manufacturer</div>
              <div className="text-sm font-semibold">제조사 R&D 연구실</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-lg group"
              onClick={() => router.push("/")}
            >
              로그인 페이지로 이동
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full h-14 rounded-2xl text-slate-500 font-medium"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 이전 페이지로
            </Button>
          </div>

          {/* Footer Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4">
            <ShieldAlert className="h-3 w-3" />
            <span>승인된 파트너사 계정만 접근 가능합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
