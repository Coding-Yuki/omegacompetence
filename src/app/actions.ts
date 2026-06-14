"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export async function getTickets(userEmail: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const tickets = await prisma.ticket.findMany({
      where: { submittedBy: userEmail },
      orderBy: { submittedAt: "desc" },
    });
    return { success: true, tickets: tickets.map(t => ({ ...t, submittedAt: t.submittedAt.toISOString() })) };
  } catch (error) {
    console.error("Failed to fetch tickets from SQLite", error);
    return { success: false, tickets: [] };
  }
}

export async function getAllTickets() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const tickets = await prisma.ticket.findMany({
      orderBy: { submittedAt: "desc" },
      include: { auditLogs: { orderBy: { timestamp: "desc" } } },
    });
    return {
      success: true,
      tickets: tickets.map(t => ({
        ...t,
        submittedAt: t.submittedAt.toISOString(),
        auditLogs: t.auditLogs.map(log => ({ ...log, timestamp: log.timestamp.toISOString() }))
      }))
    };
  } catch (error) {
    console.error("Failed to fetch all tickets from SQLite", error);
    return { success: false, tickets: [] };
  }
}

export async function createTicket(data: { title: string; description: string; priority: string; category?: string; seminarUrgency?: boolean }, userEmail: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category || "other",
        seminarUrgency: data.seminarUrgency || false,
        status: "open",
        submittedBy: userEmail,
      },
    });
    await prisma.auditLog.create({ data: { ticketId: ticket.id, action: "TICKET_CREATED", actorEmail: userEmail } });
    return { success: true, ticket: { ...ticket, submittedAt: ticket.submittedAt.toISOString(), auditLogs: [] } };
  } catch (error) {
    console.error("Failed to create ticket in SQLite", error);
    return { success: false, error: "Failed to create ticket." };
  }
}

export async function updateTicketStatus(id: string, newStatus: string, actorEmail: string = "system@omega.com", resolutionNote?: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const updateData: any = { status: newStatus };
    if (resolutionNote !== undefined) {
      updateData.resolutionNote = resolutionNote;
    }
    const ticket = await prisma.ticket.update({ where: { id }, data: updateData });
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        action: `STATUS_CHANGED_${newStatus.toUpperCase().replace(/\s+/g, "_")}`,
        actorEmail,
        details: resolutionNote || undefined,
      },
    });
    return { success: true, ticket: { ...ticket, submittedAt: ticket.submittedAt.toISOString() } };
  } catch (error) {
    console.error("Failed to update ticket status in SQLite", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function getAuditLogs(ticketId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const logs = await prisma.auditLog.findMany({ where: { ticketId }, orderBy: { timestamp: "desc" } });
    return { success: true, logs: logs.map(l => ({ ...l, timestamp: l.timestamp.toISOString() })) };
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    return { success: false, logs: [] };
  }
}

export async function assignTicket(ticketId: string, adminEmail: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedTo: adminEmail, status: "in_progress" },
    });
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        action: "TICKET_ASSIGNED",
        actorEmail: adminEmail,
      },
    });
    return { success: true, ticket: { ...ticket, submittedAt: ticket.submittedAt.toISOString() } };
  } catch (error) {
    console.error("Failed to assign ticket in SQLite", error);
    return { success: false, error: "Failed to assign ticket." };
  }
}


export async function registerUser(email: string, password: string, adminCode?: string) {
  const isAdmin = adminCode && adminCode.trim() === process.env.ADMIN_SECRET_CODE;
  if (adminCode && !isAdmin) {
    return { success: false, error: "Invalid admin code" };
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { id: uuidv4(), email, password: hashed, role: isAdmin ? "admin" : "employee" } });
    return { success: true, user };
  } catch (error) {
    console.error("registerUser error", error);
    console.error('[registerUser] FULL ERROR:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { success: false, error: "Could not create user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };
    const match = await bcrypt.compare(password, user.password ?? "");
    if (!match) return { success: false, error: "Invalid credentials" };
    const token = jwt.sign({ uid: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    (await cookies()).set("authToken", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return { success: true, role: user.role };
  } catch (e) {
    console.error("loginUser error", e);
    return { success: false, error: "Login failed" };
  }
}

export async function logoutUser() {
  (await cookies()).delete("authToken");
  return { success: true };
}

export async function getSession() {
  const token = (await cookies()).get("authToken")?.value;
  if (!token) return { authenticated: false };
  try {
    const payload = jwt.verify(token as string, JWT_SECRET) as { uid: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: payload.uid } });
    if (!user) return { authenticated: false };
    return { authenticated: true, uid: user.id, email: user.email, role: user.role };
  } catch (e) {
    console.error("getSession error", e);
    return { authenticated: false };
  }
}
