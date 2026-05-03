import { Router } from "express";
import { db, workerProfilesTable, bookingsTable, usersTable } from "@workspace/db";
import { sql, count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [workerCount] = await db
    .select({ count: count() })
    .from(workerProfilesTable);

  const [bookingCount] = await db
    .select({ count: count() })
    .from(bookingsTable);

  const categoriesResult = await db
    .selectDistinct({ skill: workerProfilesTable.skill })
    .from(workerProfilesTable);

  const topCategoriesResult = await db
    .select({
      category: workerProfilesTable.skill,
      count: count(),
    })
    .from(workerProfilesTable)
    .groupBy(workerProfilesTable.skill)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  const citiesResult = await db
    .selectDistinct({ city: usersTable.city })
    .from(usersTable);

  return res.json({
    totalWorkers: Number(workerCount.count),
    totalBookings: Number(bookingCount.count),
    totalCategories: categoriesResult.length,
    topCategories: topCategoriesResult.map((r) => ({
      category: r.category,
      count: Number(r.count),
    })),
    cities: citiesResult.map((r) => r.city),
  });
});

export default router;
