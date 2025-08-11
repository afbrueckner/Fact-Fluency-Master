import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  section: text("section").notNull(),
  initials: text("initials").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const factCategories = pgTable("fact_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operation: text("operation").notNull(), // "addition", "subtraction", "multiplication", "division"
  category: text("category").notNull(), // "foundational", "derived"
  name: text("name").notNull(), // "+/-1 or 2", "doubles", "combinations of 10", etc.
  description: text("description").notNull(),
  examples: text("examples").array().notNull(),
  phase: text("phase").notNull(), // "counting", "deriving", "mastery"
});

export const studentProgress = pgTable("student_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  factCategoryId: varchar("fact_category_id").references(() => factCategories.id).notNull(),
  phase: text("phase").notNull(), // "counting", "deriving", "mastery"
  accuracy: integer("accuracy").notNull().default(0), // percentage
  efficiency: integer("efficiency").notNull().default(0), // percentage
  flexibility: integer("flexibility").notNull().default(0), // percentage
  strategyUse: integer("strategy_use").notNull().default(0), // percentage
  lastPracticed: timestamp("last_practiced").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  operation: text("operation").notNull(),
  category: text("category").notNull(), // "foundational", "derived", "mixed"
  targetFacts: text("target_facts").array().notNull(),
  emoji: text("emoji").notNull(),
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
});

export const gameResults = pgTable("game_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  score: integer("score").notNull(),
  accuracy: integer("accuracy").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  strategiesUsed: text("strategies_used").array().notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const assessmentObservations = pgTable("assessment_observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  observationType: text("observation_type").notNull(), // "strategy", "thinking", "communication"
  content: text("content").notNull(),
  factArea: text("fact_area").notNull(),
  phase: text("phase").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickLooksSessions = pgTable("quick_looks_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  visualType: text("visual_type").notNull(), // "dots", "ten_frames", "number_lines"
  quantity: integer("quantity").notNull(),
  responses: jsonb("responses").notNull(), // student responses to discussion prompts
  accuracy: boolean("accuracy").notNull(),
  strategy: text("strategy").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const selfAssessments = pgTable("self_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  factCategoryId: varchar("fact_category_id").references(() => factCategories.id).notNull(),
  sortingChoice: text("sorting_choice").notNull(), // "know-quickly", "know-slowly", "still-learning"
  confidence: integer("confidence").notNull(), // 1-5 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProgressSchema = createInsertSchema(studentProgress).omit({
  id: true,
  lastPracticed: true,
  updatedAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  completedAt: true,
});

export const insertAssessmentObservationSchema = createInsertSchema(assessmentObservations).omit({
  id: true,
  createdAt: true,
});

export const insertQuickLooksSessionSchema = createInsertSchema(quickLooksSessions).omit({
  id: true,
  completedAt: true,
});

export const insertSelfAssessmentSchema = createInsertSchema(selfAssessments).omit({
  id: true,
  createdAt: true,
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type FactCategory = typeof factCategories.$inferSelect;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type Game = typeof games.$inferSelect;
export type GameResult = typeof gameResults.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type AssessmentObservation = typeof assessmentObservations.$inferSelect;
export type InsertAssessmentObservation = z.infer<typeof insertAssessmentObservationSchema>;
export type QuickLooksSession = typeof quickLooksSessions.$inferSelect;
export type InsertQuickLooksSession = z.infer<typeof insertQuickLooksSessionSchema>;
export type SelfAssessment = typeof selfAssessments.$inferSelect;
export type InsertSelfAssessment = z.infer<typeof insertSelfAssessmentSchema>;
