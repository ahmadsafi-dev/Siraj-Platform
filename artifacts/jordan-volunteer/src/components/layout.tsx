import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import { LogOut, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="شعار منصة سراج" className="h-10 w-auto object-contain" />
              <span>منصة سراج</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm md:text-base font-medium">
                <span className="hidden md:inline-block truncate max-w-[150px]">{user.fullName}</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                  {user.role === "student" ? "طالب مكفوف" : "متطوع"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col container mx-auto px-4 py-2" role="main">
        {children}
      </main>

      <footer className="bg-white border-t py-5">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <a
            href="mailto:info@sirajplatform.org"
            className="text-primary font-semibold hover:underline"
            aria-label="مراسلة فريق دعم منصة سراج"
          >
            هل لديك استفسار أو اقتراح ؟ تواصل معنا عبر البريد الالكتروني من هنا
          </a>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>تم برمجة واعداد هذا الموقع بواسطة م. أحمد صافي</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/ahmad-safi02"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ملف أحمد صافي على LinkedIn"
                className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.github.com/ahmadsafi-dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ملف أحمد صافي على GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
