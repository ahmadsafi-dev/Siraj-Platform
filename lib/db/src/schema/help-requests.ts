import { pgTable, serial, integer, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const requestStatusEnum = pgEnum("request_status", ["open", "accepted", "completed"]);

export const helpRequestsTable = pgTable("help_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  volunteerId: integer("volunteer_id").references(() => usersTable.id),
  subjectName: text("subject_name").notNull(),
  isExam: boolean("is_exam").notNull().default(false),
  examDate: timestamp("exam_date"),
  examLocation: text("exam_location"),
  status: requestStatusEnum("status").notNull().default("open"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHelpRequestSchema = createInsertSchema(helpRequestsTable).omit({
  id: true,
  createdAt: true,
  volunteerId: true,
  status: true,
});
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpRequest = typeof helpRequestsTable.$inferSelect;
