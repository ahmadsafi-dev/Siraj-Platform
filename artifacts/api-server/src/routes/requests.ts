import { Router, type IRouter } from "express";
import { db, helpRequestsTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateRequestBody, ListRequestsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatRequest(
  req: typeof helpRequestsTable.$inferSelect,
  studentName: string,
  studentMajor: string | null,
  studentPhone: string,
  studentUniversity: string | null,
  volunteerName?: string | null,
) {
  return {
    id: req.id,
    studentId: req.studentId,
    studentName,
    studentMajor: studentMajor ?? null,
    studentPhone,
    studentUniversity: studentUniversity ?? null,
    volunteerId: req.volunteerId ?? null,
    volunteerName: volunteerName ?? null,
    subjectName: req.subjectName,
    isExam: req.isExam,
    examDate: req.examDate?.toISOString() ?? null,
    examLocation: req.examLocation ?? null,
    status: req.status,
    notes: req.notes ?? null,
    createdAt: req.createdAt.toISOString(),
  };
}

router.get("/requests/summary", requireAuth, async (req, res) => {
  try {
    const allRequests = await db.select().from(helpRequestsTable).orderBy(desc(helpRequestsTable.createdAt)).limit(200);

    const allStudents = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      major: usersTable.major,
      phone: usersTable.phone,
      university: usersTable.university,
    }).from(usersTable);

    const studentMap = new Map(allStudents.map(s => [s.id, s]));

    // Filter by university so stats match the volunteer's feed
    const [currentUser] = await db.select({ university: usersTable.university })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId!))
      .limit(1);
    const userUniversity = currentUser?.university ?? null;

    const scoped = userUniversity
      ? allRequests.filter(r => studentMap.get(r.studentId)?.university === userUniversity)
      : allRequests;

    const totalOpen = scoped.filter(r => r.status === "open").length;
    const totalAccepted = scoped.filter(r => r.status === "accepted").length;
    const totalCompleted = scoped.filter(r => r.status === "completed").length;

    const recentRequests = scoped.slice(0, 5).map(r => {
      const student = studentMap.get(r.studentId);
      return formatRequest(r, student?.fullName ?? "", student?.major ?? null, student?.phone ?? "", student?.university ?? null);
    });

    res.json({ totalOpen, totalAccepted, totalCompleted, recentRequests });
  } catch (err) {
    req.log.error({ err }, "Error fetching summary");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.get("/requests/my", requireAuth, async (req, res) => {
  try {
    const myRequests = await db.select().from(helpRequestsTable)
      .where(eq(helpRequestsTable.studentId, req.session.userId!))
      .orderBy(desc(helpRequestsTable.createdAt));

    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

    let volunteerMap = new Map<number, string>();
    const volunteerIds = myRequests.filter(r => r.volunteerId).map(r => r.volunteerId!);
    if (volunteerIds.length > 0) {
      const volunteers = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
      volunteerMap = new Map(volunteers.map(v => [v.id, v.fullName]));
    }

    res.json(myRequests.map(r => formatRequest(
      r,
      currentUser?.fullName ?? "",
      currentUser?.major ?? null,
      currentUser?.phone ?? "",
      currentUser?.university ?? null,
      r.volunteerId ? volunteerMap.get(r.volunteerId) : null,
    )));
  } catch (err) {
    req.log.error({ err }, "Error fetching my requests");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.get("/requests", requireAuth, async (req, res) => {
  try {
    const params = ListRequestsQueryParams.safeParse(req.query);
    const statusFilter = params.success && params.data.status ? params.data.status : undefined;

    const conditions = statusFilter
      ? [eq(helpRequestsTable.status, statusFilter as "open" | "accepted" | "completed")]
      : [];

    const allRequests = conditions.length > 0
      ? await db.select().from(helpRequestsTable).where(and(...conditions)).orderBy(desc(helpRequestsTable.createdAt))
      : await db.select().from(helpRequestsTable).orderBy(desc(helpRequestsTable.createdAt));

    const allStudents = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      major: usersTable.major,
      phone: usersTable.phone,
      university: usersTable.university,
    }).from(usersTable);
    const studentMap = new Map(allStudents.map(s => [s.id, s]));

    const [currentUser] = await db.select({ university: usersTable.university })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId!))
      .limit(1);
    const volunteerUniversity = currentUser?.university ?? null;

    const filteredRequests = volunteerUniversity
      ? allRequests.filter(r => {
          const student = studentMap.get(r.studentId);
          return student?.university === volunteerUniversity;
        })
      : allRequests;

    const volunteerIds = filteredRequests.filter(r => r.volunteerId).map(r => r.volunteerId!);
    let volunteerMap = new Map<number, string>();
    if (volunteerIds.length > 0) {
      const volunteers = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
      volunteerMap = new Map(volunteers.map(v => [v.id, v.fullName]));
    }

    res.json(filteredRequests.map(r => {
      const student = studentMap.get(r.studentId);
      return formatRequest(
        r,
        student?.fullName ?? "",
        student?.major ?? null,
        student?.phone ?? "",
        student?.university ?? null,
        r.volunteerId ? volunteerMap.get(r.volunteerId) : null,
      );
    }));
  } catch (err) {
    req.log.error({ err }, "Error fetching requests");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.post("/requests", requireAuth, async (req, res) => {
  if (req.session.userRole !== "student") {
    res.status(403).json({ error: "فقط الطلاب يمكنهم إنشاء طلبات" });
    return;
  }

  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const { subjectName, isExam, examDate, examLocation, notes } = parsed.data;

  if (isExam && (!examDate || !examLocation)) {
    res.status(400).json({ error: "يرجى تحديد موعد ومكان الامتحان" });
    return;
  }

  try {
    const [newRequest] = await db.insert(helpRequestsTable).values({
      studentId: req.session.userId!,
      subjectName,
      isExam,
      examDate: isExam && examDate ? new Date(examDate) : null,
      examLocation: isExam ? (examLocation ?? null) : null,
      notes: notes ?? null,
      status: "open",
    }).returning();

    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

    res.status(201).json(formatRequest(
      newRequest,
      student?.fullName ?? "",
      student?.major ?? null,
      student?.phone ?? "",
      student?.university ?? null,
    ));
  } catch (err) {
    req.log.error({ err }, "Error creating request");
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الطلب" });
  }
});

router.get("/requests/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  try {
    const [helpReq] = await db.select().from(helpRequestsTable).where(eq(helpRequestsTable.id, id)).limit(1);
    if (!helpReq) {
      res.status(404).json({ error: "الطلب غير موجود" });
      return;
    }

    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, helpReq.studentId)).limit(1);
    let volunteerName: string | null = null;
    if (helpReq.volunteerId) {
      const [volunteer] = await db.select().from(usersTable).where(eq(usersTable.id, helpReq.volunteerId)).limit(1);
      volunteerName = volunteer?.fullName ?? null;
    }

    res.json(formatRequest(
      helpReq,
      student?.fullName ?? "",
      student?.major ?? null,
      student?.phone ?? "",
      student?.university ?? null,
      volunteerName,
    ));
  } catch (err) {
    req.log.error({ err }, "Error fetching request");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.delete("/requests/:id", requireAuth, async (req, res) => {
  if (req.session.userRole !== "student") {
    res.status(403).json({ error: "فقط الطلاب يمكنهم حذف طلباتهم" });
    return;
  }

  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  try {
    const [helpReq] = await db.select().from(helpRequestsTable)
      .where(and(eq(helpRequestsTable.id, id), eq(helpRequestsTable.studentId, req.session.userId!)))
      .limit(1);

    if (!helpReq) {
      res.status(404).json({ error: "الطلب غير موجود أو ليس لديك صلاحية حذفه" });
      return;
    }

    await db.delete(helpRequestsTable).where(eq(helpRequestsTable.id, id));

    res.json({ message: "تم حذف الطلب بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Error deleting request");
    res.status(500).json({ error: "حدث خطأ أثناء حذف الطلب" });
  }
});

router.post("/requests/:id/volunteer", requireAuth, async (req, res) => {
  if (req.session.userRole !== "volunteer") {
    res.status(403).json({ error: "فقط المتطوعون يمكنهم قبول الطلبات" });
    return;
  }

  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  try {
    const [helpReq] = await db.select().from(helpRequestsTable).where(eq(helpRequestsTable.id, id)).limit(1);
    if (!helpReq) {
      res.status(404).json({ error: "الطلب غير موجود" });
      return;
    }

    if (helpReq.status !== "open") {
      res.status(400).json({ error: "هذا الطلب تم قبوله مسبقاً" });
      return;
    }

    const [updated] = await db.update(helpRequestsTable)
      .set({ volunteerId: req.session.userId!, status: "accepted" })
      .where(eq(helpRequestsTable.id, id))
      .returning();

    // Increment volunteer's accepted count
    await db.update(usersTable)
      .set({ acceptedRequestsCount: sql`${usersTable.acceptedRequestsCount} + 1` })
      .where(eq(usersTable.id, req.session.userId!));

    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, updated.studentId)).limit(1);
    const [volunteer] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

    res.json(formatRequest(
      updated,
      student?.fullName ?? "",
      student?.major ?? null,
      student?.phone ?? "",
      student?.university ?? null,
      volunteer?.fullName ?? null,
    ));
  } catch (err) {
    req.log.error({ err }, "Error volunteering for request");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.post("/requests/:id/complete", requireAuth, async (req, res) => {
  if (req.session.userRole !== "student") {
    res.status(403).json({ error: "فقط الطلاب يمكنهم إكمال طلباتهم" });
    return;
  }

  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  try {
    const [helpReq] = await db.select().from(helpRequestsTable)
      .where(and(eq(helpRequestsTable.id, id), eq(helpRequestsTable.studentId, req.session.userId!)))
      .limit(1);

    if (!helpReq) {
      res.status(404).json({ error: "الطلب غير موجود أو ليس لديك صلاحية تعديله" });
      return;
    }

    if (helpReq.status === "completed") {
      res.status(400).json({ error: "الطلب مكتمل مسبقاً" });
      return;
    }

    const [updated] = await db.update(helpRequestsTable)
      .set({ status: "completed" })
      .where(eq(helpRequestsTable.id, id))
      .returning();

    // Increment volunteer's completed count if one is assigned
    if (helpReq.volunteerId) {
      await db.update(usersTable)
        .set({ completedRequestsCount: sql`${usersTable.completedRequestsCount} + 1` })
        .where(eq(usersTable.id, helpReq.volunteerId));
    }

    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    let volunteerName: string | null = null;
    if (updated.volunteerId) {
      const [volunteer] = await db.select().from(usersTable).where(eq(usersTable.id, updated.volunteerId)).limit(1);
      volunteerName = volunteer?.fullName ?? null;
    }

    res.json(formatRequest(
      updated,
      student?.fullName ?? "",
      student?.major ?? null,
      student?.phone ?? "",
      student?.university ?? null,
      volunteerName,
    ));
  } catch (err) {
    req.log.error({ err }, "Error completing request");
    res.status(500).json({ error: "حدث خطأ أثناء إكمال الطلب" });
  }
});

export default router;
