"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Beaker, ChevronLeft, ChevronRight, CheckCircle2, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

interface InquiryWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InquiryWizard({ open, onOpenChange, onSuccess }: InquiryWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    brand_name: "",
    item_type: "",
    target_price: "",
    quantity: "",
    capacity: "50ml",
    container_type: "Pump Bottle",
    scent_pref: "Fresh",
    special_requests: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/api/v1/workflow/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand_name: formData.brand_name,
          item_type: formData.item_type,
          target_price: parseInt(formData.target_price) || 0,
          quantity: parseInt(formData.quantity) || 0,
          scent_pref: formData.scent_pref,
          container_type: formData.container_type,
          capacity: formData.capacity,
          // 상세 항목 배점 등은 추후 확장 가능
        }),
      });

      if (!response.ok) throw new Error("Failed to submit inquiry");

      onSuccess();
      onOpenChange(false);
      setStep(1); // Reset
    } catch (error) {
      console.error(error);
      alert("의뢰 제출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setStep(1);
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/95 backdrop-blur-md">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Beaker className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">신규 화장품 개발 의뢰</DialogTitle>
          </div>
          <DialogDescription>
            성공적인 시장 진입을 위한 제품 초기 설계를 시작합니다.
          </DialogDescription>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2 text-muted-foreground font-medium">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </DialogHeader>

        <div className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">브랜드 명</Label>
                  <Input 
                    id="brand" 
                    placeholder="예: Glow Theory" 
                    value={formData.brand_name}
                    onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>제품 유형</Label>
                    <Select onValueChange={(val) => setFormData({...formData, item_type: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Serum", "Cream", "Toner", "Sunscreen", "Cleanser"].map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty">예상 발주 수량 (MOQ)</Label>
                    <Input 
                      id="qty" 
                      type="number" 
                      placeholder="예: 3000" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">목표 소비자 가격 (예상)</Label>
                  <div className="relative">
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="예: 25000" 
                      className="pl-8"
                      value={formData.target_price}
                      onChange={(e) => setFormData({...formData, target_price: e.target.value})}
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">₩</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>용량</Label>
                    <Select 
                      defaultValue={formData.capacity}
                      onValueChange={(val) => setFormData({...formData, capacity: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["15ml", "30ml", "50ml", "100ml", "200ml"].map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>용기 타입</Label>
                    <Select 
                      defaultValue={formData.container_type}
                      onValueChange={(val) => setFormData({...formData, container_type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Pump Bottle", "Tube", "Jar", "Dropper", "Mist"].map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>향료 선호도</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Unscented", "Floral", "Citrus", "Woody", "Herb", "Musk"].map(scent => (
                      <Button
                        key={scent}
                        variant={formData.scent_pref === scent ? "default" : "outline"}
                        className="text-xs h-9"
                        onClick={() => setFormData({...formData, scent_pref: scent})}
                      >
                        {scent}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center py-4">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold">의뢰 내용 확인</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  입력하신 내용을 바탕으로 AI 컨설팅 보고서가 생성됩니다.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">제품명</span>
                  <span className="font-medium">{formData.brand_name || "N/A"} {formData.item_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MOQ / Target ₩</span>
                  <span className="font-medium">{formData.quantity}개 / ₩{formData.target_price}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span className="text-slate-900">제조사 매칭</span>
                  <span className="text-primary italic">AI 추천 기반 매칭 예정</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                <Factory className="h-4 w-4 mt-0.5" />
                <p>
                  의뢰가 제출되면 1~2일 내로 선정된 파트너사로부터 <br />
                  1차 처방 제안서 및 견적서를 받아보실 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className={cn(step === 1 && "invisible")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> 이전
            </Button>
            
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!formData.brand_name || !formData.item_type}>
                다음 <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {loading ? "제출 중..." : "최종 의뢰 제출"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
