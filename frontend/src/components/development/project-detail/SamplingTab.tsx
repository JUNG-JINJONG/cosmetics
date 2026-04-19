"use client";
import { API_BASE_URL } from "@/lib/api-config";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Send, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SamplingTabProps {
  samples: any[];
  inquiry: any;
  isBuyer: boolean;
  showSampleForm: boolean;
  setShowSampleForm: (val: boolean) => void;
  showReviewForm: number | null;
  setShowReviewForm: (id: number | null) => void;
}

export const SamplingTab = ({
  samples,
  inquiry,
  isBuyer,
  showSampleForm,
  setShowSampleForm,
  showReviewForm,
  setShowReviewForm,
}: SamplingTabProps) => {

  const handleReceive = async (sampleId: number) => {
    if (!confirm("샘플을 실제로 수령하셨습니까? 수령 처리 후 품평 작성이 가능합니다.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/workflow/samples/update?sample_id=${sampleId}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sample_status_code: "1900000003" }) // 수령 완료
      });
      if (res.ok) {
        alert("샘플 수령 처리가 완료되었습니다. 이제 품평을 작성하실 수 있습니다.");
        window.location.reload();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sample Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 샘플", count: samples.length, color: "text-slate-600" },
          { label: "검사/품평 중", count: samples.filter(s => s.sample_status_code === '1900000004').length, color: "text-amber-600" },
          { label: "최종 승인", count: samples.filter(s => s.sample_status_code === '1900000005').length, color: "text-emerald-600" },
          { label: "보완 요청", count: samples.filter(s => s.sample_status_code === '1900000006').length, color: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-slate-50 dark:bg-zinc-800/50">
            <CardContent className="pt-6 text-center">
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className={cn("text-2xl font-black mt-1", stat.color)}>{stat.count}건</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 p-6 rounded-2xl">
        <div>
          <h4 className="font-bold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> 공식 샘플 제작 및 품평 이력
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            제조사의 샘플 발송 내역과 바이어의 감각 품평 결과를 실시간으로 확인합니다.
          </p>
        </div>
        {!isBuyer && (
          <Button onClick={() => setShowSampleForm(true)} className="rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 h-11 px-6">
            <Send className="h-4 w-4 mr-2" /> 새 샘플 발송 등록
          </Button>
        )}
      </div>

      {/* Sample Form (Manufacturer Only) */}
      {showSampleForm && (
        <Card className="border-primary/20 animate-in slide-in-from-top duration-300">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg">신규 샘플 발송 정보 입력</CardTitle>
            <CardDescription>바이어에게 보낼 공식 샘플의 차수와 특징을 공유해 주세요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const payload = {
                project_id: inquiry.project.project_id,
                version_number: parseInt(formData.get("version_number") as string),
                sample_name: formData.get("sample_name"),
                tracking_number: formData.get("tracking_number"),
                manufacturer_comments: formData.get("manufacturer_comments"),
                sample_status_code: "1900000002" // 발송 완료
              };

              try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/api/v1/workflow/samples`, {
                  method: "POST",
                  headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  alert("샘플 발송 정보가 등록되었습니다.");
                  window.location.reload();
                }
              } catch (err) { console.error(err); }
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">샘플 차수 (V-ID)</label>
                  <input name="version_number" required type="number" defaultValue={samples.length + 1} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">샘플 명칭</label>
                  <input name="sample_name" required placeholder="예: 1차 제형 샘플 (쿨링감 강화)" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">배송 송장 번호</label>
                  <input name="tracking_number" placeholder="대한통운 123456789" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">제조사 처방 특징 및 코멘트</label>
                  <textarea name="manufacturer_comments" rows={6} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-zinc-800" placeholder="성분 배합 조정 및 텍스처 특징을 기술해 주세요." />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowSampleForm(false)}>취소</Button>
                  <Button type="submit" className="px-8 font-bold">발송 등록</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sample Timeline / List */}
      <div className="space-y-4">
        {samples.length === 0 ? (
          <div className="p-20 text-center bg-slate-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed">
            <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400">아직 등록된 공식 샘플 데이터가 없습니다.</p>
          </div>
        ) : (
          samples.map((sample, idx) => (
            <Card key={sample.project_sample_id} className="overflow-hidden border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="w-full md:w-48 bg-slate-50 dark:bg-zinc-800/50 p-6 flex flex-col justify-center items-center gap-2 border-r">
                  <Badge variant="outline" className="text-xs bg-white">{new Date(sample.created_at).toLocaleDateString()}</Badge>
                  <div className="text-3xl font-black text-primary">V{sample.version_number}</div>
                  <Badge className={cn(
                    "mt-2",
                    sample.sample_status_code === "1900000005" ? "bg-emerald-100 text-emerald-700" :
                    sample.sample_status_code === "1900000006" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {sample.sample_status_code === "1900000001" ? "준비 중" :
                     sample.sample_status_code === "1900000002" ? "발송 완료" :
                     sample.sample_status_code === "1900000003" ? "수령" :
                     sample.sample_status_code === "1900000004" ? "품평 기록" :
                     sample.sample_status_code === "1900000005" ? "최종 승인" :
                     sample.sample_status_code === "1900000006" ? "보완 요청" : "반려"}
                  </Badge>
                </div>
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xl font-bold">{sample.sample_name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-slate-500">송장번호: {sample.tracking_number || "미등록"}</p>
                        {sample.tracking_number && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-[10px] text-blue-600 font-bold bg-blue-50 hover:bg-blue-100"
                            onClick={() => window.open(`https://search.naver.com/search.naver?query=${sample.tracking_number}`, '_blank')}
                          >
                            배송 추적
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isBuyer && sample.sample_status_code === "1900000002" && (
                        <Button 
                          onClick={() => handleReceive(sample.project_sample_id)}
                          className="rounded-lg h-9 font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> 수령 확인
                        </Button>
                      )}
                      {isBuyer && parseInt(sample.sample_status_code) >= 1900000003 && sample.sample_status_code !== "1900000005" && (
                        <Button variant="outline" size="sm" onClick={() => setShowReviewForm(sample.project_sample_id)} className="rounded-lg h-9 font-bold border-primary/30 text-primary">
                          <Star className="h-3.5 w-3.5 mr-2" /> 품평 작성하기
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-xs text-muted-foreground block mb-2 underline underline-offset-4">제조사 발송 코멘트</span>
                    {sample.manufacturer_comments}
                  </div>

                  {/* Reviews Display */}
                  {sample.reviews && sample.reviews.length > 0 && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-dashed">
                      {sample.reviews.map((review: any) => (
                        <div key={review.sample_review_id} className="bg-amber-50/30 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100/50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("h-4 w-4", i < review.overall_score ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                                ))}
                              </div>
                              <span className="text-sm font-bold">바이어 종합 품평</span>
                            </div>
                            <Badge className={cn(
                                review.decision === "Approved" ? "bg-emerald-500" :
                                review.decision === "Modify" ? "bg-rose-500" : "bg-slate-500"
                            )}>
                              {review.decision === "Approved" ? "최종 승인" :
                               review.decision === "Modify" ? "보완 필요" : "반려"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-xs">
                              <span className="text-muted-foreground block">향 만족도</span>
                              <span className="font-bold">{review.scent_score} / 5</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground block">제형/사용감</span>
                              <span className="font-bold">{review.texture_score} / 5</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground block">흡수력</span>
                              <span className="font-bold">{review.absorption_score} / 5</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground block">보습/기능성</span>
                              <span className="font-bold">{review.moisture_score} / 5</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{review.detailed_feedback}"
                          </p>
                          {review.improvement_requests && (
                            <div className="mt-3 p-3 bg-white dark:bg-black/20 rounded-lg text-xs border border-amber-200/50">
                              <span className="font-bold text-rose-600 block mb-1">보완 요청사항:</span>
                              {review.improvement_requests}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Form (Buyer Only) */}
                  {showReviewForm === sample.project_sample_id && (
                    <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl space-y-6 animate-in zoom-in-95 duration-300">
                      <h6 className="font-bold text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> 감각 품평 기록
                      </h6>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const payload = {
                          overall_score: parseFloat(formData.get("overall_score") as string),
                          scent_score: parseInt(formData.get("scent_score") as string),
                          texture_score: parseInt(formData.get("texture_score") as string),
                          absorption_score: parseInt(formData.get("absorption_score") as string),
                          moisture_score: parseInt(formData.get("moisture_score") as string),
                          detailed_feedback: formData.get("detailed_feedback"),
                          improvement_requests: formData.get("improvement_requests"),
                          decision: formData.get("decision")
                        };

                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`${API_BASE_URL}/api/v1/workflow/samples/reviews/create?sample_id=${sample.project_sample_id}`, {
                            method: "POST",
                            headers: { 
                               "Authorization": `Bearer ${token}`,
                               "Content-Type": "application/json"
                            },
                            body: JSON.stringify(payload)
                          });
                          if (res.ok) {
                            alert("품평이 등록되었습니다. 상태가 업데이트됩니다.");
                            window.location.reload();
                          }
                        } catch (err) { console.error(err); }
                      }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {[
                            { name: "overall_score", label: "종합 별점", type: "number", step: "0.1", def: 5 },
                            { name: "scent_score", label: "향", type: "number", step: "1", def: 5 },
                            { name: "texture_score", label: "제형", type: "number", step: "1", def: 5 },
                            { name: "absorption_score", label: "흡수", type: "number", step: "1", def: 5 },
                            { name: "moisture_score", label: "기능", type: "number", step: "1", def: 5 },
                          ].map((score) => (
                            <div key={score.name} className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">{score.label}</label>
                              <input name={score.name} required type={score.type} step={score.step} min="1" max="5" defaultValue={score.def} className="w-full p-2 rounded-lg border bg-white dark:bg-zinc-900 font-bold" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <textarea name="detailed_feedback" required placeholder="상세한 품평 의견을 남겨주세요 (필수)" className="w-full p-4 rounded-xl border bg-white dark:bg-zinc-900 min-h-[100px]" />
                          <textarea name="improvement_requests" placeholder="수정이 필요한 사항이 있다면 기록해주세요 (선택)" className="w-full p-4 rounded-xl border bg-white dark:bg-zinc-900 border-dashed" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="decision" value="Approved" required className="accent-emerald-600 h-4 w-4" />
                              <span className="text-sm font-bold group-hover:text-emerald-600 transition-colors">최종 제형 승인</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="decision" value="Modify" className="accent-rose-600 h-4 w-4" />
                              <span className="text-sm font-bold group-hover:text-rose-600 transition-colors">보완 후 재제작</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="decision" value="Rejected" className="accent-slate-600 h-4 w-4" />
                              <span className="text-sm font-bold group-hover:text-slate-600 transition-colors">반려</span>
                            </label>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button type="button" variant="ghost" onClick={() => setShowReviewForm(null)}>취소</Button>
                            <Button type="submit" className="bg-primary px-10 font-black rounded-xl">품평 제출 및 결정 알림</Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
