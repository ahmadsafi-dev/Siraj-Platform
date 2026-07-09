import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    phone: user.phone,
    role: user.role,
    fullName: user.fullName,
    major: user.major ?? null,
    university: user.university ?? null,
    acceptedRequestsCount: user.acceptedRequestsCount,
    completedRequestsCount: user.completedRequestsCount,
    createdAt: user.createdAt,
  };
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const { phone, password, role, fullName, major, university } = parsed.data;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "رقم الهاتف مسجل مسبقاً" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      phone,
      passwordHash,
      role,
      fullName,
      major: role === "student" ? (major ?? null) : null,
      university: university ?? null,
    }).returning();

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.status(201).json({
      user: formatUser(user),
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (err) {
    req.log.error({ err }, "Error registering user");
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب" });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const { phone, password } = parsed.data;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) {
      res.status(401).json({ error: "رقم الهاتف أو كلمة المرور غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "رقم الهاتف أو كلمة المرور غير صحيحة" });
      return;
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({
      user: formatUser(user),
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    if (!user) {
      res.status(401).json({ error: "المستخدم غير موجود" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Error fetching current user");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
