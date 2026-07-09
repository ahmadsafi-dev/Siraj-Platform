import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data.user);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `أهلاً بك يا ${data.user.fullName}`,
        });
        setLocation(data.user.role === "student" ? "/student" : "/volunteer");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: "رقم الهاتف أو كلمة المرور غير صحيحة",
        });
      },
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values });
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full py-4">
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 border-b border-border/50 mb-6">
          <CardTitle className="text-3xl font-bold text-primary mb-2">تسجيل الدخول</CardTitle>
          <CardDescription className="text-lg">
            أهلاً بك في منصة سراج للمكفوفين والمتطوعين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="07xxxxxxxx" className="h-14 text-lg" dir="ltr" {...field} />
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
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-muted-foreground text-base">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              سجل الآن
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
}
