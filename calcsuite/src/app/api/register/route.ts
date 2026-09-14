// Registration API route
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (db) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          id: randomUUID(),
          email,
          name: name || null,
          role: "user" as const,
          subscriptionStatus: "registered" as const,
        })
        .returning();

      return NextResponse.json(
        {
          message: "Registration successful",
          user: {
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name,
          },
        },
        { status: 201 }
      );
    }

    // Fallback when database is not available
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
