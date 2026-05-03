import { Router } from "express";
import { db, bookingsTable, usersTable, workerProfilesTable, reviewsTable } from "@workspace/db";
import { eq, or, sql } from "drizzle-orm";
import { CreateBookingBody, UpdateBookingStatusBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

router.get("/bookings", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const userId = req.session.userId!;
  const userType = req.session.userType!;

  let bookings;

  if (userType === "customer") {
    bookings = await db
      .select({
        id: bookingsTable.id,
        customerId: bookingsTable.customerId,
        customerName: usersTable.name,
        workerId: bookingsTable.workerId,
        workerName: sql<string>`worker_user.name`,
        workerSkill: workerProfilesTable.skill,
        workerHourlyRate: workerProfilesTable.hourlyRate,
        date: bookingsTable.date,
        time: bookingsTable.time,
        address: bookingsTable.address,
        notes: bookingsTable.notes,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .innerJoin(usersTable, eq(bookingsTable.customerId, usersTable.id))
      .innerJoin(workerProfilesTable, eq(bookingsTable.workerId, workerProfilesTable.id))
      .innerJoin(
        sql`users AS worker_user`,
        sql`worker_user.id = ${workerProfilesTable.userId}`
      )
      .where(eq(bookingsTable.customerId, userId))
      .orderBy(sql`${bookingsTable.createdAt} DESC`);
  } else {
    const workerId = req.session.workerId!;
    bookings = await db
      .select({
        id: bookingsTable.id,
        customerId: bookingsTable.customerId,
        customerName: usersTable.name,
        workerId: bookingsTable.workerId,
        workerName: sql<string>`worker_user.name`,
        workerSkill: workerProfilesTable.skill,
        workerHourlyRate: workerProfilesTable.hourlyRate,
        date: bookingsTable.date,
        time: bookingsTable.time,
        address: bookingsTable.address,
        notes: bookingsTable.notes,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .innerJoin(usersTable, eq(bookingsTable.customerId, usersTable.id))
      .innerJoin(workerProfilesTable, eq(bookingsTable.workerId, workerProfilesTable.id))
      .innerJoin(
        sql`users AS worker_user`,
        sql`worker_user.id = ${workerProfilesTable.userId}`
      )
      .where(eq(bookingsTable.workerId, workerId))
      .orderBy(sql`${bookingsTable.createdAt} DESC`);
  }

  const bookingIds = bookings.map((b) => b.id);
  let reviewedBookingIds = new Set<number>();

  if (bookingIds.length > 0) {
    const reviews = await db
      .select({ bookingId: reviewsTable.bookingId })
      .from(reviewsTable)
      .where(sql`${reviewsTable.bookingId} = ANY(${sql.raw(`ARRAY[${bookingIds.join(",")}]::int[]`)})`);
    reviewedBookingIds = new Set(reviews.map((r) => r.bookingId));
  }

  return res.json(
    bookings.map((b) => ({
      ...b,
      hasReview: reviewedBookingIds.has(b.id),
      createdAt: b.createdAt.toISOString(),
    }))
  );
});

router.post("/bookings", async (req, res) => {
  if (!requireAuth(req, res)) return;

  if (req.session.userType !== "customer") {
    return res.status(403).json({ error: "Only customers can create bookings" });
  }

  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { workerId, date, time, address, notes } = parsed.data;
  const customerId = req.session.userId!;

  const [worker] = await db
    .select()
    .from(workerProfilesTable)
    .where(eq(workerProfilesTable.id, workerId));

  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({ customerId, workerId, date, time, address, notes: notes ?? null })
    .returning();

  const [customerUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, customerId));

  const [workerUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, worker.userId));

  return res.status(201).json({
    ...booking,
    customerName: customerUser.name,
    workerName: workerUser.name,
    workerSkill: worker.skill,
    workerHourlyRate: worker.hourlyRate,
    hasReview: false,
    createdAt: booking.createdAt.toISOString(),
  });
});

router.get("/bookings/:bookingId", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const bookingId = parseInt(req.params.bookingId);
  if (isNaN(bookingId)) {
    return res.status(400).json({ error: "Invalid booking ID" });
  }

  const [booking] = await db
    .select({
      id: bookingsTable.id,
      customerId: bookingsTable.customerId,
      customerName: usersTable.name,
      workerId: bookingsTable.workerId,
      workerName: sql<string>`worker_user.name`,
      workerSkill: workerProfilesTable.skill,
      workerHourlyRate: workerProfilesTable.hourlyRate,
      date: bookingsTable.date,
      time: bookingsTable.time,
      address: bookingsTable.address,
      notes: bookingsTable.notes,
      status: bookingsTable.status,
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .innerJoin(usersTable, eq(bookingsTable.customerId, usersTable.id))
    .innerJoin(workerProfilesTable, eq(bookingsTable.workerId, workerProfilesTable.id))
    .innerJoin(
      sql`users AS worker_user`,
      sql`worker_user.id = ${workerProfilesTable.userId}`
    )
    .where(eq(bookingsTable.id, bookingId));

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const [review] = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.bookingId, bookingId));

  return res.json({
    ...booking,
    hasReview: !!review,
    createdAt: booking.createdAt.toISOString(),
  });
});

router.patch("/bookings/:bookingId/status", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const bookingId = parseInt(req.params.bookingId);
  if (isNaN(bookingId)) {
    return res.status(400).json({ error: "Invalid booking ID" });
  }

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { status } = parsed.data;
  const userType = req.session.userType!;
  const userId = req.session.userId!;

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId));

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (userType === "worker") {
    if (booking.workerId !== req.session.workerId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).json({ error: "Workers can only accept or reject" });
    }
  } else if (userType === "customer") {
    if (booking.customerId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (status !== "completed") {
      return res.status(400).json({ error: "Customers can only mark as completed" });
    }
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status })
    .where(eq(bookingsTable.id, bookingId))
    .returning();

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, updated.customerId));
  const [workerProfile] = await db.select().from(workerProfilesTable).where(eq(workerProfilesTable.id, updated.workerId));
  const [workerUser] = await db.select().from(usersTable).where(eq(usersTable.id, workerProfile.userId));
  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.bookingId, bookingId));

  return res.json({
    ...updated,
    customerName: customer.name,
    workerName: workerUser.name,
    workerSkill: workerProfile.skill,
    workerHourlyRate: workerProfile.hourlyRate,
    hasReview: !!review,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
