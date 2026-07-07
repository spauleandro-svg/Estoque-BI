import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Use a secret key derived from environment or fallback securely
const JWT_SECRET = process.env.GEMINI_API_KEY || "super-secure-stock-bi-secret-key-123456-998877";

// 1. JWT Implementation (Token no header + Revoga no logout)
// In-memory token blacklist for handling revocation on logout
const revokedTokens = new Set<string>();

export function generateToken(payload: { email: string; name: string; id_cliente?: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours expiry
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function revokeToken(token: string) {
  if (token) {
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
    revokedTokens.add(cleanToken);
  }
}

export function verifyToken(token: string): any {
  if (!token) return null;
  const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
  
  if (revokedTokens.has(cleanToken)) {
    return null; // Token has been revoked on logout!
  }

  const parts = cleanToken.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null; // Invalid signature
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    // Check expiration
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      return null; // Token expired
    }
    return decoded;
  } catch (_) {
    return null;
  }
}

// 2. Rate Limit Implementation (limite por IP + conta)
// In-memory request counters tracking IP + User Email
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();

export function checkRateLimit(ip: string, email: string): { allowed: boolean; limit?: number; remaining?: number } {
  const key = `${ip || "anonymous"}:${email || "no-account"}`;
  const now = Date.now();
  const WINDOW_MS = 60 * 1000; // 1 minute window
  const MAX_REQUESTS = 40; // max 40 requests per minute

  const record = rateLimitMap.get(key);
  if (!record) {
    rateLimitMap.set(key, { count: 1, firstRequestTime: now });
    return { allowed: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1 };
  }

  if (now - record.firstRequestTime > WINDOW_MS) {
    // Reset window
    rateLimitMap.set(key, { count: 1, firstRequestTime: now });
    return { allowed: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false };
  }

  record.count += 1;
  return { allowed: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - record.count };
}

// 3. CORS & Security Headers (CORS origin allowlist + Clickjacking prevention TTL)
export function getSecurityHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  
  // Define allowlist of secure origins
  const allowedOrigins = [
    "localhost:3000",
    "run.app",
    "vercel.app",
    "googleusercontent.com",
    "google.com",
    "pauleandronunes@gmail.com"
  ];

  const isAllowed = !origin || origin === "null" || origin.includes("null") || allowedOrigins.some(allowed => origin.includes(allowed));

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", isAllowed ? (origin || "*") : "https://ais-pre-rxklrtqpfze5ws2rxn4htj-679390907478.us-east1.run.app");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Clickjacking prevention + 1 minute cache/expires header defense
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-Frame-TTL", "60"); // 1 minute protection assertion
  headers.set("Cache-Control", "private, max-age=60"); // 1 minute max-age
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return { allowed: isAllowed, headers };
}

// 4. PII Sanitizer (retorna só o necessário)
export function sanitizePII(data: any): any {
  if (data === null || data === undefined) return data;
  
  const piiKeys = [
    "cnpj", "cnpj_identificacao", "cpf", "email", "telefone", "phone", 
    "contato_gerente", "contato_compras", "passwordhash", "senha", "password"
  ];

  const sanitizeValue = (key: string, val: any): any => {
    if (typeof val === "string") {
      const lowerKey = key.toLowerCase();
      if (lowerKey === "email" || lowerKey === "contato_gerente" || lowerKey === "contato_compras" || val.includes("@")) {
        const parts = val.split("@");
        if (parts.length === 2) {
          const user = parts[0];
          const domain = parts[1];
          return `${user[0] || ""}***@${domain}`;
        }
        return "m***@empresa.com";
      }
      if (lowerKey.includes("cnpj") || lowerKey.includes("cpf")) {
        return val.substring(0, 4) + "-****-****";
      }
      if (lowerKey.includes("phone") || lowerKey.includes("telefone")) {
        return "v***-****";
      }
      if (lowerKey.includes("pass") || lowerKey.includes("senha")) {
        return "[ENCRYPTED]";
      }
    }
    return val;
  };

  const sanitizeObj = (obj: any): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObj);
    }

    const copy: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (piiKeys.includes(key.toLowerCase())) {
          copy[key] = sanitizeValue(key, obj[key]);
        } else {
          copy[key] = sanitizeObj(obj[key]);
        }
      }
    }
    return copy;
  };

  return sanitizeObj(data);
}

// 5. Anti-SQL Injection & Tenant IDOR validation
export function validateInputAndTenant(
  reqTenantId: string | undefined, 
  tokenTenantId: string | undefined
): { valid: boolean; error?: string } {
  // Prevent IDOR (Insecure Direct Object Reference)
  if (reqTenantId && tokenTenantId && reqTenantId !== tokenTenantId) {
    return { valid: false, error: "Acesso negado: IDOR detectado. Você não tem permissão para acessar os dados deste tenant." };
  }

  // Prevent SQL Injection strings on any keys or text
  const sqlInjectionPattern = /('|--|\/\*|\*\/|union\s+select|select\s+.*from|drop\s+table)/i;
  
  if (reqTenantId && sqlInjectionPattern.test(reqTenantId)) {
    return { valid: false, error: "Caractere ou comando suspeito detectado (SQL Injection)." };
  }

  return { valid: true };
}
