import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRequest, getGetMyRequestsQueryKey, getListRequestsQueryKey, getGetRequestsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, BookOpen, FileText } from "lucide-react";

const requestSchema = z.object({
  subjectName: z.string().min(3, "اسم المادة مطلوب"),
  isExam: z.boolean().default(false),
  examDate: z.string().optional(),
  examLocation: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.isExam) {
    if (!data.examDate) return false;
    if (!data.examLocation || data.examLocation.trim() === "") return false;
  }
  return true;
}, {
  message: "تاريخ ومكان الامتحان مطلوبان",
  path: ["examDate"], // this will highlight examDate generally, though UI handles both
});

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      subjectName: "",
      isExam: false,
      examDate: "",
      examLocation: "",
      notes: "",
    },
  });

  const isExam = form.watch("isExam");

  const createMutation = useCreateRequest({
    mutation: {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: getGetMyRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRequestsSummaryQueryKey() });
        
        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "سيتم إشعار المتطوعين بطلبك، وسنقوم بإعلامك عند قبول الطلب.",
        });
        setLocation("/student");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "فشل إرسال الطلب",
          description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        });
      },
    },
  });

  function onSubmit(values: z.infer<typeof requestSchema>) {
    createMutation.mutate({ data: values });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 h-12 w-12 rounded-full hover:bg-secondary">
          <Link href="/student">
            <ArrowRight className="w-6 h-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">طلب مساعدة جديد</h1>
          <p className="text-muted-foreground mt-1">الرجاء إدخال تفاصيل المادة ونوع المساعدة المطلوبة</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="bg-secondary/20 p-6 rounded-2xl border border-border">
                <FormField
                  control={form.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-bold flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        اسم المادة أو الكتاب
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: مقدمة في علم النفس" className="h-14 text-lg bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-secondary/20 p-6 rounded-2xl border border-border">
                <FormField
                  control={form.control}
                  name="isExam"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg">
                      <div className="space-y-1.5">
                        <FormLabel className="text-lg font-bold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          مساعدة في تقديم امتحان؟
                        </FormLabel>
                        <FormDescription className="text-base text-muted-foreground">
                          قم بتفعيل هذا الخيار إذا كنت تحتاج مساعدة لتقديم امتحان
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary scale-125"
                          dir="ltr"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isExam && (
                  <div className="mt-6 pt-6 border-t border-border grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <FormField
                      control={form.control}
                      name="examDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">تاريخ ووقت الامتحان</FormLabel>
                          <FormControl>
                            {/* Simple datetime-local input, fully accessible and native */}
                            <Input 
                              type="datetime-local" 
                              className="h-14 text-lg bg-white" 
                              dir="ltr"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="examLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">مكان الامتحان (القاعة والمبنى)</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: قاعة 101 - كلية الآداب" className="h-14 text-lg bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="bg-secondary/20 p-6 rounded-2xl border border-border">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-bold">ملاحظات إضافية (اختياري)</FormLabel>
                      <FormDescription className="text-base mb-3">
                        أي معلومات قد تفيد المتطوع (مثل: طبيعة المساعدة، طريقة التواصل المفضلة)
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب ملاحظاتك هنا..." 
                          className="min-h-[120px] text-lg bg-white resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold shadow-md hover:shadow-lg transition-all" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "جاري الإرسال..." : "تأكيد الطلب"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
