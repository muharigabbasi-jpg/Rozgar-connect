import { Router } from "express";
import bcrypt from "bcrypt";
import { db, usersTable, workerProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SignupBody, LoginBody } from "@workspace/api-zod";

const router = Router();

function sanitizeUser(user: typeof usersTable.$inferSelect, workerId?: number) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    city: user.city,
    userType: user.userType,
    ...(workerId !== undefined ? { workerId } : {}),
  };
}

router.post("/auth/signup", async (req, res) => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { name, phone, password, city, userType, skill, hourlyRate, bio } = parsed.data;

  if (userType === "worker" && (!skill || !hourlyRate)) {
    return res.status(400).json({ error: "Workers must provide skill and hourly rate" });
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.phone, phone), eq(usersTable.userType, userType)));

  if (existing.length > 0) {
    return res.status(409).json({ error: "Phone number already registered for this user type" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ name, phone, passwordHash, city, userType })
    .returning();

  let workerId: number | undefined;
  if (userType === "worker" && skill && hourlyRate) {
    const [profile] = await db
      .insert(workerProfilesTable)
      .values({ userId: user.id, skill, hourlyRate, bio: bio ?? null })
      .returning();
    workerId = profile.id;
  }

  req.session.userId = user.id;
  req.session.userType = user.userType;
  if (workerId) req.session.workerId = workerId;

  return res.status(201).json({ user: sanitizeUser(user, workerId) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { phone, password, userType } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.phone, phone), eq(usersTable.userType, userType)));

  if (!user) {
    return res.status(401).json({ error: "Invalid phone number or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid phone number or password" });
  }

  let workerId: number | undefined;
  if (userType === "worker") {
    const [profile] = await db
      .select()
      .from(workerProfilesTable)
      .where(eq(workerProfilesTable.userId, user.id));
    workerId = profile?.id;
  }

  req.session.userId = user.id;
  req.session.userType = user.userType;
  if (workerId) req.session.workerId = workerId;

  return res.json({ user: sanitizeUser(user, workerId) });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Session invalid" });
  }

  return res.json({ user: sanitizeUser(user, req.session.workerId) });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {});
  return res.json({ success: true });
});

export default router;
