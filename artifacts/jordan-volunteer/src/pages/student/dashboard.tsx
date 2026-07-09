import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useGetMyRequests,
  useDeleteRequest,
  useCompleteRequest,
  getGetMyRequestsQueryKey,
  HelpRequestStatus,
  HelpRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Calendar, MapPin, Clock, BookOpen, User as UserIcon, Trash2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<HelpRequest | null>(null);

  const { data: requests, isLoading } = useGetMyRequests({
    query: { enabled: !!user && user.role === "student" } as any,
  });

  const deleteMutation = useDeleteRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyRequestsQueryKey() });
        setDeleteTarget(null);
        toast({ title: "تم حذف الطلب", description: "تم حذف الطلب بنجاح." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "حدث خطأ", description: "لم نتمكن من حذف الطلب." });
      },
    },
  });

  const completeMutation = useCompleteRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyRequestsQueryKey() });
        toast({ title: "تم الإكمال!", description: "بالتوفيق" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "حدث خطأ", description: "لم نتمكن من إكمال الطلب." });
      },
    },
  });

  const getStatusBadge = (status: HelpRequestStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 text-sm py-1 px-3">قيد الانتظار</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-sm py-1 px-3">تم القبول</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-sm py-1 px-3">مكتمل</Badge>;
      default:
        return <Badge variant="outline" className="text-sm py-1 px-3">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "EEEE، d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">طلباتي</h1>
          <p className="text-muted-foreground">تابع حالة طلباتك أو أضف طلباً جديداً للمساعدة</p>
        </div>
        <Link href="/student/new-request" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base font-bold shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="w-5 h-5" />
            <span>طلب مساعدة جديد</span>
          </Button>
        </Link>
      </div>

      {!requests || requests.length === 0 ? (
        <Card className="border-dashed border-2 bg-secondary/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">لا توجد طلبات سابقة</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              يمكنك طلب مساعدة في قراءة مادة دراسية أو تقديم امتحان. المتطوعون جاهزون لمساعدتك.
            </p>
            <Link href="/student/new-request">
              <Button size="lg" className="h-14 px-8 text-base font-bold">
                أضف طلبك الأول
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className={`h-2 w-full ${request.status === 'open' ? 'bg-yellow-400' : request.status === 'accepted' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-secondary/50 font-medium">
                    {request.isExam ? "مساعدة في امتحان" : "مساعدة في قراءة"}
                  </Badge>
                  {getStatusBadge(request.status)}
                </div>
                <CardTitle className="text-xl line-clamp-2 mt-2">{request.subjectName}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                {request.isExam && request.examDate && (
                  <div className="flex items-start gap-3 text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{formatDate(request.examDate)}</span>
                  </div>
                )}

                {request.isExam && request.examLocation && (
                  <div className="flex items-start gap-3 text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{request.examLocation}</span>
                  </div>
                )}

                {request.volunteerName && (
                  <div className="flex items-center gap-3 bg-green-50 text-green-900 p-4 rounded-xl border border-green-100">
                    <UserIcon className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-0.5">المتطوع المقبول:</p>
                      <p className="font-bold">{request.volunteerName}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1 border-t">
                  <Clock className="w-3.5 h-3.5" />
                  <span>تاريخ الطلب: {format(new Date(request.createdAt), "dd/MM/yyyy")}</span>
                </div>
              </CardContent>

              {/* Action buttons — only for non-completed requests */}
              {request.status !== "completed" && (
                <CardFooter className="pt-0 pb-4 px-4 gap-3">
                  {/* Complete button (green) — only if accepted */}
                  {request.status === "accepted" && (
                    <Button
                      className="flex-1 h-11 font-bold bg-green-600 hover:bg-green-700 text-white gap-1.5"
                      onClick={() => completeMutation.mutate({ id: request.id })}
                      disabled={completeMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      اكتمال الطلب
                    </Button>
                  )}
                  {/* Delete button (red) */}
                  <Button
                    variant="outline"
                    className={`h-11 font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 ${request.status === "accepted" ? "" : "flex-1"}`}
                    onClick={() => setDeleteTarget(request)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف الطلب
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-xl">هل أنت متأكد من حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم حذف طلب "<strong>{deleteTarget?.subjectName}</strong>" نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "نعم، احذف الطلب"}
            </AlertDialogAction>
            <AlertDialogCancel className="font-bold">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
