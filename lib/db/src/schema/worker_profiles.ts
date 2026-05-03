import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const workerProfilesTable = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
  hourlyRate: real("hourly_rate").notNull(),
  bio: text("bio"),
  avgRating: real("avg_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfilesTable).omit({
  id: true,
  avgRating: true,
  totalReviews: true,
  createdAt: true,
});

export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type WorkerProfile = typeof workerProfilesTable.$inferSelect;
