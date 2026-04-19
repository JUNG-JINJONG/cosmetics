"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  History,
  TrendingUp,
  Sparkles,
  Search,
  Hash,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  DollarSign,
  Briefcase,
  PieChart,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function BusinessCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. KPI 데이터 가져오기
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/business/copilot/metrics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKpiData(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // 초기 환영 메시지 삭제 (가이드 UI 노출을 위해)
  }, []);

  // 2. 메시지 전송 핸들러 (실제 API 호출)
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const token = localStorage.getItem("token");
    const userMsgText = inputText;
    setInputText("");
    
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMsgText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/business/copilot/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsgText })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
        // 지표가 변했을 수 있으니 다시 갱신
        fetchMetrics();
      }
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-[calc(100vh-48px)] bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      
      {/* 1. Left Sidebar: History (Sync with AI Consultant Style) */}
      <aside className="w-80 border-r bg-white dark:bg-zinc-900/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Button 
            className="w-full justify-start gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            onClick={() => { setMessages([]); setInputText(""); }}
          >
            <Plus className="h-4 w-4" /> 새 비즈니스 분석
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="h-3 w-3" /> 최근 분석 이력
          </div>
          {/* 실제 세션 연동은 추후 DB 연동 시 추가 (현재는 디자인 샘플) */}
          {["3월 매출 종합 분석", "비건 립밤 정산 현황", "신규 프로젝트 생산 단가"].map((title, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 group transition-all"
            >
              <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
              <span className="truncate flex-1 font-medium">{title}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
        <div className="p-4 border-t bg-slate-50/50">
           <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border shadow-sm">
             <div className="flex items-center gap-2 text-blue-600 mb-1">
               <TrendingUp className="h-4 w-4" />
               <span className="text-xs font-bold">인기 분석 키워드</span>
             </div>
             <div className="flex flex-wrap gap-1">
               {["영업이익", "MOQ", "생산지연"].map(tag => (
                 <span key={tag} className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-slate-500">#{tag}</span>
               ))}
             </div>
           </div>
        </div>
      </aside>

      {/* 2. Main Center: Chat Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950 shadow-2xl relative z-10 border-x">
        {/* Chat Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold flex items-center gap-1.5">
                AI 비즈니스 코파일럿 코코
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">실시간 데이터 기반 분석 지원 중</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Search className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><History className="h-4 w-4" /></Button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl relative mx-auto">
                <Bot className="h-10 w-10" />
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-900 border-4 border-white dark:border-zinc-950">
                  <Sparkles className="h-3 w-3 fill-current" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-black tracking-tight">안녕하세요, 비즈니스 전문 분석가 코코입니다.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  현재 운영 중인 발주, 정산, 프로젝트 데이터를 실시간으로 분석해 드립니다. <br />
                  궁금하신 비즈니스 지표를 아래 예시처럼 물어보세요.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "이번 달 전체 매출 현황을 요약해줘",
                  "현재 미결제된 정산 내역과 합계는?",
                  "이번 달에 가장 많이 주문된 품목 리스트",
                  "진행 중인 프로젝트들의 생산 일정 요약"
                ].map(q => (
                  <Button 
                    key={q} 
                    variant="outline" 
                    className="h-auto p-4 text-left block text-xs bg-white hover:border-blue-300 hover:text-blue-600 transition-all dark:bg-zinc-900 shadow-sm"
                    onClick={() => { setInputText(q); }}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1 text-slate-900 dark:text-zinc-100 italic">
                      <Hash className="h-3 w-3 text-blue-500" /> Topic
                    </div>
                    <span className="line-clamp-1">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col animate-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn("flex gap-3 max-w-[80%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("h-9 w-9 rounded-xl shrink-0 flex items-center justify-center border shadow-sm", msg.role === "user" ? "bg-white text-slate-600" : "bg-slate-900 text-white")}>
                    {msg.role === "user" ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg",
                    msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 mx-12 font-mono italic">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex gap-3 animate-pulse items-start">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white"><Sparkles className="h-5 w-5" /></div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-zinc-800 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-8 border-t bg-white dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto relative group">
            <Input 
              placeholder="데이터 엔진에 질문을 입력하세요 (예: 3월 매출 분석)"
              className="h-14 pr-16 pl-8 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-base dark:bg-zinc-900/50"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSendMessage()}
            />
            <Button 
              size="icon" 
              className={cn(
                "absolute right-2.5 top-2.5 h-9 w-9 rounded-2xl transition-all shadow-lg",
                inputText.trim() ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-slate-300 dark:bg-zinc-800 cursor-not-allowed"
              )}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-black tracking-widest uppercase">
            Platform Data Engine v2.0 - Security Encryption Active
          </p>
        </div>
      </main>

      {/* 3. Right Sidebar: Mini Dashboard (KPIs) */}
      <aside className="w-80 p-8 bg-slate-50/50 dark:bg-zinc-900/10 border-l hidden xl:flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-blue-600" /> Executive Insights
        </h2>

        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-inner text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex items-center text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 실시간
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">누적 정산 완료 매출</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpiData?.currency || "USD"} {kpiData?.total_sales?.toLocaleString() || "0"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-inner text-blue-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex items-center text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 활성
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">진행 중인 프로젝트</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpiData?.active_projects || "0"} 건
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-inner text-amber-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="flex items-center text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 대기
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">확정 대기 정산액</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpiData?.currency || "USD"} {kpiData?.pending_amount?.toLocaleString() || "0"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none font-bold space-y-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
             <Bot className="h-20 w-20" />
           </div>
           <div className="flex items-center gap-2 text-indigo-100 text-[10px] uppercase font-black tracking-widest">
             <Calendar className="h-4 w-4" /> AI Recommendation
           </div>
           <p className="text-sm leading-relaxed relative z-10">
             "비건 화장품 라인의 성장세가 뚜렷합니다. 하반기 공급량을 15% 늘리는 것을 제안합니다."
           </p>
           <Button className="w-full bg-white text-indigo-700 hover:bg-slate-50 font-black text-xs h-10 rounded-2xl shadow-lg border-none relative z-10 transition-all active:scale-95">
             실행 계획 상세보기
           </Button>
        </div>

        <div className="mt-auto space-y-4 pt-12">
           <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Analysis Precision</span>
             <span className="text-[10px] font-black text-blue-600 italic">98.2%</span>
           </div>
           <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 rounded-full w-[98.2%]" />
           </div>
        </div>
      </aside>

    </div>
  );
}
