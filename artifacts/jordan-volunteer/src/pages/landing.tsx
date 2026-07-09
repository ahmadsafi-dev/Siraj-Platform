import { Link } from "wouter";

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa] px-6"
      dir="rtl"
    >
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <img
          src="/logo.png"
          alt="شعار منصة سراج"
          className="w-36 h-36 object-contain mb-6 drop-shadow-md"
        />

        <h1 className="text-4xl font-extrabold text-[#1a2e4a] mb-3 tracking-tight">
          منصة سراج
        </h1>

        <p className="text-[#4a5568] text-base leading-relaxed mb-10">
          منصة سراج هي حلقة الوصل بين الطلبة المكفوفين في الجامعات الأردنية
          والزملاء المتطوعين، لتقديم الدعم الأكاديمي والمساعدة بكل يسر وسهولة.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/login">
            <button
              className="w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-[#1a2e4a] hover:bg-[#243d61] active:bg-[#0f1d2e] transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-[#1a2e4a]/40"
              aria-label="الانتقال إلى صفحة تسجيل الدخول"
            >
              تسجيل الدخول
            </button>
          </Link>

          <Link href="/register">
            <button
              className="w-full py-4 px-6 rounded-xl text-lg font-bold text-[#1a2e4a] bg-white border-2 border-[#1a2e4a] hover:bg-[#1a2e4a] hover:text-white active:bg-[#0f1d2e] transition-colors duration-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1a2e4a]/40"
              aria-label="الانتقال إلى صفحة إنشاء حساب جديد"
            >
              إنشاء حساب جديد
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
