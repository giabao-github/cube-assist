"use server";

import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

const USER_INFO_PATH = path.resolve(
  process.cwd(),
  "src/private/user-info.json",
);

export interface UserInfo {
  name: string;
  email: string;
  password: string;
  updatedAt: string;
}

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const formatUpdatedAt = (updatedAt: string, locale: string = "vi-VN") => {
  return new Date(updatedAt).toLocaleString(locale);
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const getAllUsersInternal = async (): Promise<UserInfo[]> => {
  try {
    const exists = await fileExists(USER_INFO_PATH);
    if (!exists) {
      return [];
    }
    const data = await readFile(USER_INFO_PATH, "utf-8");
    return JSON.parse(data) as UserInfo[];
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
};

// Server Actions
export async function getAllUsers(): Promise<UserInfo[]> {
  return getAllUsersInternal();
}

export async function addUser(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const validatedData = userSchema.parse(rawData);

    // Check if user already exists
    const users = await getAllUsersInternal();
    const existingUser = users.find((u) => u.email === validatedData.email);

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Add new user
    users.push({
      ...validatedData,
      updatedAt: formatUpdatedAt(new Date().toISOString()),
    });

    await writeFile(USER_INFO_PATH, JSON.stringify(users, null, 2), "utf-8");

    return {
      success: true,
      message: "User added successfully",
    };
  } catch (error) {
    console.error("Error adding user:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Failed to add user",
    };
  }
}

export async function updateUserPassword(email: string, newPassword: string) {
  try {
    const users = await getAllUsersInternal();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return {
        success: false,
        error: "User not found",
      };
    }

    users[userIndex].password = newPassword;
    users[userIndex].updatedAt = formatUpdatedAt(new Date().toISOString());

    await writeFile(USER_INFO_PATH, JSON.stringify(users, null, 2), "utf-8");

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}

export async function getUserByEmail(email: string): Promise<UserInfo | null> {
  try {
    const users = await getAllUsersInternal();
    return users.find((u) => u.email === email) || null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function deleteUser(email: string) {
  try {
    const users = await getAllUsersInternal();
    const filteredUsers = users.filter((u) => u.email !== email);

    if (filteredUsers.length === users.length) {
      return {
        success: false,
        error: "User not found",
      };
    }

    await writeFile(
      USER_INFO_PATH,
      JSON.stringify(filteredUsers, null, 2),
      "utf-8",
    );

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}
