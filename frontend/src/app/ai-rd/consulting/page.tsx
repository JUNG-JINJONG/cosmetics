"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  History,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api-config";

interface Message {
  message_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Session {
  session_id: number;
  title: string;
  created_at: string;
}

interface ReportData {
  product_name: string;
  target_market: string;
  concept_summary: string;
  key_ingredients: string[];
  formula_suggestion: string;
  marketing_points: string[];
  expected_effect: string;
}

export default function AIConsultingChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. 세션 목록 가져오기
  async function fetchSessions() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/ai-rd/consulting/sessions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  }

  // 2. 메시지 내역 가져오기
  async function fetchMessages(sessionId: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/ai-rd/consulting/sessions/${sessionId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setCurrentSessionId(sessionId);
        // 리포트 존재 여부도 확인
        fetchReport(sessionId);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }

  // 리포트 가져오기
  async function fetchReport(sessionId: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/ai-rd/consulting/sessions/${sessionId}/report`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      setReportData(null);
    }
  }

  // 리포트 생성 요청
  async function handleGenerateReport() {
    if (!currentSessionId || messages.length < 3) return;
    
    setIsGeneratingReport(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/ai-rd/consulting/sessions/${currentSessionId}/generate-report`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setShowReport(true);
      }
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  // 3. 메시지 전송
  async function handleSendMessage() {
    if (!inputText.trim()) return;

    const token = localStorage.getItem("token");
    const userMsgText = inputText;
    setInputText("");
    
    // UI 즉시 업데이트 (낙관적 업데이트)
    const tempUserMsg: Message = {
      message_id: Date.now(),
      role: "user",
      content: userMsgText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai-rd/consulting/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsgText,
          session_id: currentSessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          message_id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
        
        if (!currentSessionId) {
          setCurrentSessionId(data.session_id);
          fetchSessions();
        }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInputText("");
  };

  return (
    <div className="flex h-[calc(100vh-48px)] bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* 1. Sidebar: Chat History */}
      <aside className="w-80 border-r bg-white dark:bg-zinc-900/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Button 
            className="w-full justify-start gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            onClick={startNewChat}
          >
            <Plus className="h-4 w-4" /> 새 컨설팅 시작
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="h-3 w-3" /> 최근 상담 내역
          </div>
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => fetchMessages(session.session_id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-all group",
                currentSessionId === session.session_id 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <MessageSquare className={cn(
                "h-4 w-4 shrink-0",
                currentSessionId === session.session_id ? "text-blue-500" : "text-slate-400"
              )} />
              <span className="truncate flex-1">{session.title}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
        <div className="p-4 border-t bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">인기 키워드</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {["비건 립밤", "항산화 세럼", "무기차자"].map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-slate-500">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main: Chat Interface */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-zinc-950">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold flex items-center gap-1.5">
                AI 컨설턴트 코코(Coco)
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">실시간 제품 개발 가이드 제공 중</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentSessionId && (
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-8 gap-2 font-bold transition-all",
                  reportData 
                    ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                )}
                onClick={() => reportData ? setShowReport(true) : handleGenerateReport()}
                disabled={isGeneratingReport || messages.length < 3}
              >
                {isGeneratingReport ? (
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {reportData ? "전략 리포트 보기" : "전략 리포트 생성"}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Search className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </header>

        {/* Report Dialog */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-50 dark:bg-zinc-950">
            {reportData && (
              <div className="relative">
                {/* Decoration Header */}
                <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                  <Badge className="bg-white/20 text-white border-none mb-3 backdrop-blur-md">AI Strategic Analysis</Badge>
                  <h2 className="text-2xl font-black tracking-tight">{reportData.product_name}</h2>
                  <p className="text-blue-100 text-xs font-medium mt-1">Product Development Strategy Report</p>
                </div>
                
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Target & Concept */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">주요 타겟</h3>
                      <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{reportData.target_market}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">핵심 요약</h3>
                      <p className="text-sm font-medium leading-relaxed italic border-l-2 border-blue-600 pl-3">
                        "{reportData.concept_summary}"
                      </p>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                      </div>
                      핵심 추천 원료
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {reportData.key_ingredients.map((ing, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border font-bold text-slate-700 dark:text-zinc-300">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Formula */}
                  <div className="space-y-3 bg-white dark:bg-zinc-900 p-5 rounded-2xl border shadow-sm">
                    <h3 className="text-sm font-black text-blue-600 dark:text-blue-400">제형 제안</h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 font-medium">
                      {reportData.formula_suggestion}
                    </p>
                  </div>

                  {/* Strategy */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black">마켓플레이스 전략</h3>
                    <ul className="space-y-2">
                      {reportData.marketing_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm group">
                          <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i+1}
                          </div>
                          <span className="text-slate-600 dark:text-zinc-300 group-hover:text-blue-600 transition-colors">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t font-medium text-xs text-center text-muted-foreground italic">
                    가이드된 전략은 현재 시장 데이터와 제미나이 AI 분석을 바탕으로 최적화되었습니다.
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar bg-slate-50/30 dark:bg-zinc-950"
        >
          {messages.length === 0 && !isTyping ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl relative">
                <Bot className="h-10 w-10" />
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-900 border-4 border-white dark:border-zinc-950">
                  <Sparkles className="h-3 w-3 fill-current" />
                </div>
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-xl font-black tracking-tight">안녕하세요, 지능형 컨설턴트 코코입니다.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  개발하고 싶으신 제품에 대해 말씀해 주세요. <br />
                  타겟 시장 분석부터 성분 추천, 마케팅 포인트까지 AI가 제안해 드립니다.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "환절기용 고보습 수분 크림 개발 전략은?",
                  "미국 중서부 시장 타겟의 비건 립스틱 추천 성분",
                  "20대 민감성 피부를 위한 저자극 폼클렌징 처방",
                  "최근 중국 시장 내 기능성 화장품 트렌드 보고서"
                ].map(q => (
                  <Button 
                    key={q} 
                    variant="outline" 
                    className="h-auto p-4 text-left block text-xs bg-white hover:border-blue-300 hover:text-blue-600 transition-all dark:bg-zinc-900"
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
            <>
              {messages.map((msg) => (
                <div 
                  key={msg.message_id} 
                  className={cn(
                    "flex flex-col animate-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-start gap-3 max-w-[85%]",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm",
                      msg.role === "user" ? "bg-white text-slate-600" : "bg-blue-600 text-white border-blue-600"
                    )}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === "user" 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-100 dark:border-zinc-800 rounded-tl-none whitespace-pre-wrap"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-11 italic">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-zinc-800">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t bg-white dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto relative group">
            <Input 
              placeholder="무엇이든 물어보세요..."
              className="h-14 pr-16 pl-6 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50 shadow-inner focus:border-blue-400 transition-all text-base dark:bg-zinc-900/50"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="icon" 
              className={cn(
                "absolute right-2 top-2 h-10 w-10 rounded-xl transition-all",
                inputText.trim() ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none" : "bg-slate-300 dark:bg-zinc-800 cursor-not-allowed"
              )}
              disabled={!inputText.trim()}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-tighter">
            Powered by Gemini AI - 모든 답변은 화장품 연구 데이터를 기반으로 생성됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
