import { Router } from "express";
import { db, usersTable, workerProfilesTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";

const router = Router();

router.get("/workers", async (req, res) => {
  const { category, city, search } = req.query as {
    category?: string;
    city?: string;
    search?: string;
  };

  const conditions = [];

  if (category) {
    conditions.push(ilike(workerProfilesTable.skill, `%${category}%`));
  }
  if (city) {
    conditions.push(ilike(usersTable.city, `%${city}%`));
  }
  if (search) {
    conditions.push(
      sql`(${ilike(usersTable.name, `%${search}%`)} OR ${ilike(workerProfilesTable.skill, `%${search}%`)})`
    );
  }

  const workers = await db
    .select({
      id: workerProfilesTable.id,
      userId: workerProfilesTable.userId,
      name: usersTable.name,
      city: usersTable.city,
      skill: workerProfilesTable.skill,
      hourlyRate: workerProfilesTable.hourlyRate,
      avgRating: workerProfilesTable.avgRating,
      totalReviews: workerProfilesTable.totalReviews,
      bio: workerProfilesTable.bio,
    })
    .from(workerProfilesTable)
    .innerJoin(usersTable, eq(workerProfilesTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res.json(workers);
});

router.get("/workers/categories", async (_req, res) => {
  const result = await db
    .selectDistinct({ skill: workerProfilesTable.skill })
    .from(workerProfilesTable);
  const categories = result.map((r) => r.skill);
  return res.json(categories);
});

router.get("/workers/:workerId", async (req, res) => {
  const workerId = parseInt(req.params.workerId);
  if (isNaN(workerId)) {
    return res.status(400).json({ error: "Invalid worker ID" });
  }

  const [worker] = await db
    .select({
      id: workerProfilesTable.id,
      userId: workerProfilesTable.userId,
      name: usersTable.name,
      city: usersTable.city,
      skill: workerProfilesTable.skill,
      hourlyRate: workerProfilesTable.hourlyRate,
      avgRating: workerProfilesTable.avgRating,
      totalReviews: workerProfilesTable.totalReviews,
      bio: workerProfilesTable.bio,
    })
    .from(workerProfilesTable)
    .innerJoin(usersTable, eq(workerProfilesTable.userId, usersTable.id))
    .where(eq(workerProfilesTable.id, workerId));

  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const reviews = await db
    .select({
      id: reviewsTable.id,
      bookingId: reviewsTable.bookingId,
      customerId: reviewsTable.customerId,
      customerName: usersTable.name,
      workerId: reviewsTable.workerId,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.customerId, usersTable.id))
    .where(eq(reviewsTable.workerId, workerId))
    .orderBy(sql`${reviewsTable.createdAt} DESC`);

  return res.json({
    ...worker,
    reviews: reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

export default router;
