import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requiredInProduction = [
  "MONGODB_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

const isPlaceholder = (value = "") =>
  /replace|example|your_|localhost|127\.0\.0\.1/i.test(value);

export const validateEnvironment = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = requiredInProduction.filter((name) => !process.env[name]?.trim());
  const unsafe = ["JWT_SECRET", "JWT_REFRESH_SECRET"].filter(
    (name) => process.env[name] && (process.env[name].length < 32 || isPlaceholder(process.env[name])),
  );

  if (missing.length || unsafe.length) {
    const problems = [
      missing.length ? `missing: ${missing.join(", ")}` : null,
      unsafe.length ? `must be at least 32 non-placeholder characters: ${unsafe.join(", ")}` : null,
    ].filter(Boolean);

    throw new Error(`Invalid production environment (${problems.join("; ")})`);
  }

  const publicUrls = [process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean);
  for (const value of publicUrls) {
    const publicUrl = new URL(value);
    if (publicUrl.protocol !== "https:") {
      throw new Error("CLIENT_URL and FRONTEND_URL must use HTTPS in production");
    }
  }
};

export const getAllowedOrigins = () => {
  const configured = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .map((value) => value.trim().replace(/\/$/, ""));

  return [...new Set(configured)];
};
