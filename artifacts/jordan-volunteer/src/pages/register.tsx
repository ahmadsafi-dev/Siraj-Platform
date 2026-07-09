import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const UNIVERSITIES = [
  "الجامعة الأردنية",
  "جامعة اليرموك",
  "جامعة مؤتة",
  "جامعة العلوم والتكنولوجيا الأردنية",
  "الجامعة الهاشمية",
  "جامعة البلقاء التطبيقية",
  "جامعة الطفيلة التقنية",
  "جامعة الحسين بن طلال",
  "جامعة آل البيت",
  "الجامعة الألمانية الأردنية",
  "جامعة عمان العربية",
  "جامعة الشرق الأوسط",
  "جدار الجامعة",
  "الجامعة العربية المفتوحة",
  "جامعة العلوم الاسلامية العالمية",
  "جامعة العلوم التطبيقية الخاصة",
  "جامعة فيلادلفيا",
  "جامعة الإسراء",
  "جامعة البترا",
  "جامعة الزيتونة الأردنية",
  "جامعة الزرقاء",
  "جامعة اربد الأهلية",
  "جامعة جرش",
  "جامعة الأميرة سمية للتكنولوجيا",
  "الاكاديمية الاردنية للموسيقى",
  "الكلية الجامعية التطبيقية الأردنية للتعليم الفندقي والسياحي",
  "معهد البحر الأحمر للفنون السنمائية",
  "الجامعة الأمريكية في مادبا",
  "جامعة عجلون الوطنية",
  "جامعة أخرى",
];

const registerSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل مطلوب"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["student", "volunteer"]),
  university: z.string().min(1, "يرجى اختيار الجامعة"),
  major: z.string().optional(),
}).refine((data) => {
  if (data.role === "student" && (!data.major || data.major.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "التخصص مطلوب للطلاب المكفوفين",
  path: ["major"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      role: "student",
      university: "",
      major: "",
    },
  });

  const watchRole = form.watch("role");

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data.user);
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `أهلاً بك يا ${data.user.fullName}`,
        });
        setLocation(data.user.role === "student" ? "/student" : "/volunteer");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "فشل إنشاء الحساب",
          description: (error as any)?.error || "يرجى المحاولة مرة أخرى",
        });
      },
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const payload = {
      ...values,
      major: values.role === "student" ? values.major : undefined,
    };
    registerMutation.mutate({ data: payload as Parameters<typeof registerMutation.mutate>[0]["data"] });
  }

  return (
    <div className="max-w-xl mx-auto mt-8 mb-12">
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 border-b border-border/50 mb-6">
          <CardTitle className="text-3xl font-bold text-primary mb-2">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-lg">
            انضم إلى منصة التطوع للجامعة الأردنية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">نوع الحساب</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                        dir="rtl"
                      >
                        <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0 bg-secondary/30 p-4 rounded-xl border border-secondary hover:bg-secondary/50 transition-colors cursor-pointer flex-1">
                          <FormControl>
                            <RadioGroupItem value="student" className="h-6 w-6" />
                          </FormControl>
                          <FormLabel className="font-semibold text-lg cursor-pointer w-full">
                            طالب مكفوف
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0 bg-secondary/30 p-4 rounded-xl border border-secondary hover:bg-secondary/50 transition-colors cursor-pointer flex-1">
                          <FormControl>
                            <RadioGroupItem value="volunteer" className="h-6 w-6" />
                          </FormControl>
                          <FormLabel className="font-semibold text-lg cursor-pointer w-full">
                            متطوع
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك الكامل" className="h-14 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="0790000000" className="h-14 text-lg" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="h-14 text-lg" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">الجامعة</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full h-14 text-lg rounded-md border border-input bg-background px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="اختر جامعتك"
                        >
                          <option value="" disabled>اختر الجامعة</option>
                          {UNIVERSITIES.map((uni) => (
                            <option key={uni} value={uni}>{uni}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchRole === "student" && (
                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <FormLabel className="text-base font-semibold">التخصص</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل تخصصك الجامعي" className="h-14 text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold mt-4" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-muted-foreground text-base">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
