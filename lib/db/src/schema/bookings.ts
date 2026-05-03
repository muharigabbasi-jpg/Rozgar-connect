import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { workerProfilesTable } from "./worker_profiles";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  workerId: integer("worker_id")
    .notNull()
    .references(() => workerProfilesTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  time: text("time").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
