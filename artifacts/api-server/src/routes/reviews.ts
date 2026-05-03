import { Router } from "express";
import { db, reviewsTable, bookingsTable, usersTable, workerProfilesTable } from "@workspace/db";
import { eq, sql, avg, count } from "drizzle-orm";
import { CreateReviewBody } from "@workspace/api-zod";

const router = Router();

router.post("/reviews", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.session.userType !== "customer") {
    return res.status(403).json({ error: "Only customers can leave reviews" });
  }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { bookingId, rating, comment } = parsed.data;
  const customerId = req.session.userId!;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId));

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (booking.customerId !== customerId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (booking.status !== "completed") {
    return res.status(400).json({ error: "Can only review completed bookings" });
  }

  const existing = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.bookingId, bookingId));

  if (existing.length > 0) {
    return res.status(409).json({ error: "Review already submitted for this booking" });
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      bookingId,
      customerId,
      workerId: booking.workerId,
      rating,
      comment: comment ?? null,
    })
    .returning();

  const ratingStats = await db
    .select({
      avg: avg(reviewsTable.rating),
      cnt: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.workerId, booking.workerId));

  const newAvg = parseFloat(ratingStats[0].avg ?? "0");
  const newCount = Number(ratingStats[0].cnt ?? 0);

  await db
    .update(workerProfilesTable)
    .set({ avgRating: newAvg, totalReviews: newCount })
    .where(eq(workerProfilesTable.id, booking.workerId));

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, customerId));

  return res.status(201).json({
    ...review,
    customerName: customer.name,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
