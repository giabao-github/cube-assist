"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { db } from "@/db";
import { account } from "@/db/schema";

export async function changePassword(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: "Please fill out all password fields",
      };
    }

    if (email.length > 0 && newPassword.toLowerCase() === email.toLowerCase()) {
      return {
        success: false,
        error: "New password must not match email address",
      };
    }

    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return {
        success: false,
        error: "Please login to continue",
      };
    }

    await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      },
      headers: headersList,
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Password update error:", error);

    // Handle Zod validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return {
        success: false,
        error: "Invalid field data",
      };
    }

    // Handle better-auth specific errors
    if (error && typeof error === "object") {
      // Check for HTTP response errors
      if ("status" in error) {
        const status = error.status as number;
        if (status === 400 || status === 401) {
          return {
            success: false,
            error: "The current password is incorrect",
          };
        }
      }

      // Check error message
      if ("message" in error) {
        const errorMessage = error.message as string;

        if (
          errorMessage.includes("Invalid password") ||
          errorMessage.includes("incorrect") ||
          errorMessage.includes("current password") ||
          errorMessage.includes("wrong password")
        ) {
          return {
            success: false,
            error: "The current password is incorrect",
          };
        }

        if (
          errorMessage.includes("weak") ||
          errorMessage.includes("requirements") ||
          errorMessage.includes("invalid new password")
        ) {
          return {
            success: false,
            error: "The new password is too weak or does not meet requirements",
          };
        }
      }
    }

    return {
      success: false,
      error: "An error occurred while updating password",
    };
  }
}

export async function testNewPassword(email: string, newPassword: string) {
  const context = await auth.$context;
  const userResult = await context.internalAdapter.findUserByEmail(email);

  if (!userResult || !userResult.user) {
    return { success: false, error: "User is not found" };
  }

  // Try to get all accounts for this user using Drizzle ORM
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, userResult.user.id));

  // Find the email/password account
  const passwordAccount = accounts.find((acc) => acc.password);

  // Check if there are multiple password accounts
  const passwordAccounts = accounts.filter((acc) => acc.password);
  if (passwordAccounts.length > 1) {
    console.warn(
      `User (id: ${userResult.user.id}) (${userResult.user.email}) has multiple password accounts`,
    );
    return {
      success: false,
      error: "Multiple password accounts detected. Please contact support.",
    };
  }

  const passwordHash = passwordAccount?.password;

  if (!passwordHash) {
    return {
      success: false,
      error: "Cannot find the current password",
    };
  }

  const isSame = await context.password.verify({
    password: newPassword,
    hash: passwordHash,
  });

  if (isSame) {
    return {
      success: false,
      error: "The new password must not match the current one",
    };
  }

  return { success: true };
}
