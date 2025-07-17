import crypto from "crypto";

export async function checkPasswordPwned(
  password: string,
): Promise<{ isPwned: boolean; count: number }> {
  // Input validation
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  try {
    // Generate SHA-1 hash of the password
    const hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    // Get first 5 characters (prefix) and remaining characters (suffix)
    const hashPrefix = hash.substring(0, 5);
    const hashSuffix = hash.substring(5);

    // Make API request to HaveIBeenPwned
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "PasswordChecker/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.text();

    // Parse response to find matching hash suffix
    const lines = data.split("\n");
    for (const line of lines) {
      const [suffix, count] = line.trim().split(":");
      if (suffix === hashSuffix) {
        return {
          isPwned: true,
          count: parseInt(count, 10),
        };
      }
    }

    // Password not found in breaches
    return {
      isPwned: false,
      count: 0,
    };
  } catch (error) {
    throw new Error(
      `Failed to check password: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function checkPasswordsBatch(
  passwords: string[],
): Promise<
  Array<{ index: number; isPwned: boolean; count: number; error?: string }>
> {
  if (!Array.isArray(passwords)) {
    throw new Error("Passwords must be an array");
  }

  const promises = passwords.map(async (password, index) => {
    try {
      const result = await checkPasswordPwned(password);
      return {
        index,
        ...result,
      };
    } catch (error) {
      return {
        index,
        isPwned: false,
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  return Promise.all(promises);
}

export async function getPasswordRecommendation(password: string): Promise<{
  isPwned: boolean;
  count: number;
  recommendation: string;
  severity: string;
}> {
  const result = await checkPasswordPwned(password);

  let recommendation = "";
  let severity = "safe";

  if (result.isPwned) {
    if (result.count > 100000) {
      recommendation =
        "This password is extremely common and has been found in major data breaches. Change it immediately.";
      severity = "critical";
    } else if (result.count > 10000) {
      recommendation =
        "This password has been compromised in data breaches. You should change it soon.";
      severity = "high";
    } else if (result.count > 1000) {
      recommendation =
        "This password has been found in data breaches. Consider changing it.";
      severity = "medium";
    } else {
      recommendation =
        "This password has been found in data breaches, though less frequently. Consider changing it.";
      severity = "low";
    }
  } else {
    recommendation = "This password has not been found in known data breaches.";
    severity = "safe";
  }

  return {
    ...result,
    recommendation,
    severity,
  };
}
