import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  useListRequests,
  useVolunteerForRequest,
  useGetRequestsSummary,
  getListRequestsQueryKey,
  getGetRequestsSummaryQueryKey,
  HelpRequestStatus,
  HelpRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar, MapPin, BookOpen, User as UserIcon,
  CheckCircle2, HeartHandshake, Phone, Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function buildWhatsAppLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("0") ? digits.slice(1) : digits;
  return `https://wa.me/962${local}`;
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "open" | "accepted">("open");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [acceptedId, setAcceptedId] = useState<number | null>(null);

  const { data: summary, isLoading: isLoadingSummary } = useGetRequestsSummary();

  const { data: requests, isLoading: isLoadingRequests } = useListRequests(
    filter === "all" ? {} : { status: filter }
  );

  const volunteerMutation = useVolunteerForRequest({
    mutation: {
      onSuccess: (data) => {
        setAcceptedId(data.id);
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRequestsSummaryQueryKey() });
        toast({
          title: "جزاك الله خيراً!",
          description: "تم قبول الطلب بنجاح. تواصل مع الطالب لتحديد موعد المساعدة.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: "لم نتمكن من قبول هذا الطلب، ربما تم قبوله مسبقاً.",
        });
      },
    },
  });

  const handleAccept = () => {
    if (!selectedRequest) return;
    volunteerMutation.mutate({ id: selectedRequest.id });
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "EEEE، d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: HelpRequestStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-sm py-1 px-3">متاح للتطوع</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-sm py-1 px-3">تم قبول المساعدة</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-sm py-1 px-3">مكتمل</Badge>;
      default:
        return <Badge variant="outline" className="text-sm py-1 px-3">{status}</Badge>;
    }
  };

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-12 w-full max-w-md mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const isRequestAccepted = selectedRequest && acceptedId === selectedRequest.id;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 md:w-10 md:h-10" />
            أهلاً بك، {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl">
            "مَن نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ"
          </p>
        </div>
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-yellow-400" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground font-medium mb-1">طلبات بانتظار المساعدة</p>
              <p className="text-4xl font-bold text-foreground">{summary?.totalOpen || 0}</p>
            </div>
            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-blue-500" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground font-medium mb-1">طلبات قبلتها</p>
              <p className="text-4xl font-bold text-foreground">{summary?.totalAccepted || 0}</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-green-500" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground font-medium mb-1">طلبات مكتملة</p>
              <p className="text-4xl font-bold text-foreground">{summary?.totalCompleted || 0}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Feed */}
      <div className="space-y-6">
        <Tabs defaultValue="open" onValueChange={(v) => setFilter(v as any)} dir="rtl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">لوحة الطلبات</h2>
            <TabsList className="h-12 p-1 bg-secondary/50 rounded-xl">
              <TabsTrigger value="open" className="text-base h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">المتاحة فقط</TabsTrigger>
              <TabsTrigger value="all" className="text-base h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">جميع الطلبات</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="mt-6 outline-none">
            {isLoadingRequests ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-border">
                <div className="w-20 h-20 bg-secondary mx-auto rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">لا توجد طلبات في هذا القسم</h3>
                <p className="text-muted-foreground text-lg">جميع الطلبات الحالية تمت تلبيتها. شكراً لاهتمامك!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => (
                  <Card key={request.id} className="flex flex-col border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white">
                    <div className={`h-1.5 w-full ${request.status === 'open' ? 'bg-yellow-400' : request.status === 'accepted' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <CardHeader className="pb-3 bg-secondary/10">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="bg-white font-bold text-sm px-3 py-1">
                          {request.isExam ? "امتحان" : "قراءة"}
                        </Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      <CardTitle className="text-xl line-clamp-2 leading-tight">{request.subjectName}</CardTitle>
                    </CardHeader>

                    <CardContent className="pt-4 flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-foreground font-medium bg-secondary/20 px-3 py-2 rounded-lg">
                        <UserIcon className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{request.studentName}</span>
                        {request.studentMajor && (
                          <>
                            <span className="text-muted-foreground px-1">-</span>
                            <span className="text-muted-foreground truncate text-sm">{request.studentMajor}</span>
                          </>
                        )}
                      </div>

                      {request.isExam && (
                        <div className="space-y-2">
                          {request.examDate && (
                            <div className="flex items-start gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-snug">{formatDate(request.examDate)}</span>
                            </div>
                          )}
                          {request.examLocation && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-snug">{request.examLocation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {request.notes && (
                        <div className="text-sm p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-muted-foreground italic line-clamp-3">"{request.notes}"</p>
                        </div>
                      )}

                      {request.status !== "open" && request.volunteerName && (
                        <div className="mt-4 text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-100 inline-block w-full text-center">
                          المتطوع: {request.volunteerName}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 pb-5 px-5">
                      {request.status === "open" ? (
                        <Button
                          className="w-full h-12 text-lg font-bold shadow-sm"
                          onClick={() => { setSelectedRequest(request); setAcceptedId(null); }}
                        >
                          عرض التفاصيل
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full h-12 text-lg font-bold" disabled>
                          {request.status === "accepted" ? "قيد التنفيذ" : "مكتمل"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact + Accept Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">تفاصيل الطلب</DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              راجع تفاصيل الطالب وتواصل معه عبر واتساب
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Student info rows */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">اسم الطالب</p>
                  <p className="font-semibold text-foreground">{selectedRequest.studentName}</p>
                </div>
              </div>

              {selectedRequest.studentUniversity && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">الجامعة</p>
                    <p className="font-semibold text-foreground">{selectedRequest.studentUniversity}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">المادة</p>
                  <p className="font-semibold text-foreground">{selectedRequest.subjectName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">رقم الهاتف</p>
                  <p className="font-semibold text-foreground" dir="ltr">{selectedRequest.studentPhone}</p>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                {/* Accept button */}
                {isRequestAccepted ? (
                  <div className="flex items-center justify-center gap-2 h-12 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    تم قبول الطلب بنجاح
                  </div>
                ) : (
                  <Button
                    className="w-full h-12 text-base font-bold"
                    onClick={handleAccept}
                    disabled={volunteerMutation.isPending}
                  >
                    {volunteerMutation.isPending ? "جاري القبول..." : "قبول وتطوع الآن"}
                  </Button>
                )}

                {/* WhatsApp button */}
                <a
                  href={buildWhatsAppLink(selectedRequest.studentPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    تواصل عبر واتساب
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
