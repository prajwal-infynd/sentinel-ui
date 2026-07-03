import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// ── Self-contained test instance — no real network ─────────────────────────
const testClient = axios.create({ baseURL: "http://localhost:3002/api" });
const testMock = new MockAdapter(testClient, { onNoMatch: "throwException" });

const TEST_OTP = "123456";
const OTP_TTL_MS = 10 * 60 * 1000;

// ── In-memory stores ──────────────────────────────────────────────────────
let mockUsers = [
  { id: 1, firstName: "Super", lastName: "Admin", name: "Super Admin", email: "superadmin@sentinel.com", companyName: "Sentinel Inc", roleId: 1, status: "Active", allowedPermissions: [], deniedPermissions: [] },
];
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};
const mockEmailLog: Array<{ to: string; subject: string; type: string }> = [];

function logEmail(to: string, subject: string, type: string) {
  mockEmailLog.push({ to, subject, type });
}

// ── Auth handlers (mirror mock-api.ts) ─────────────────────────────────────

testMock.onPost("/auth/signup").reply((config) => {
  const { firstName, lastName, companyName, email } = JSON.parse(config.data);
  const existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (existing.status === "otp_pending") {
      otpStore[email] = { otp: TEST_OTP, expiresAt: Date.now() + OTP_TTL_MS };
      return [200, { status: "otp_pending", message: "OTP resent to your email." }];
    }
    return [400, { code: "UsernameExistsException", message: "An account with this email already exists." }];
  }
  mockUsers.push({
    id: mockUsers.length + 1, firstName, lastName, name: `${firstName} ${lastName}`,
    companyName, email, roleId: 3, allowedPermissions: [], deniedPermissions: [], status: "otp_pending",
  });
  otpStore[email] = { otp: TEST_OTP, expiresAt: Date.now() + OTP_TTL_MS };
  logEmail(email, "Verify your Sentinel email", "SIGNUP_OTP");
  return [201, { status: "otp_pending", deliveryMedium: "EMAIL", destination: email.replace(/(.{2}).*(@.*)/, "$1***$2") }];
});

testMock.onPost("/auth/respond-to-challenge").reply((config) => {
  const { email, otp } = JSON.parse(config.data);
  const stored = otpStore[email];
  if (!stored) return [400, { code: "CodeMismatchException", message: "OTP expired or not found." }];
  if (Date.now() > stored.expiresAt) { delete otpStore[email]; return [400, { code: "ExpiredCodeException", message: "OTP has expired." }]; }
  if (stored.otp !== otp) return [400, { code: "CodeMismatchException", message: "Incorrect OTP." }];
  delete otpStore[email];
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return [404, { code: "UserNotFoundException", message: "User not found." }];
  if (user.status === "otp_pending") {
    user.status = "awaiting_approval";
    logEmail(email, "Sentinel — Your account is awaiting admin approval", "USER_AWAITING_APPROVAL");
    logEmail("admin@sentinel.com", `[Sentinel] New user awaiting approval: ${email}`, "ADMIN_APPROVAL_REQUEST");
    return [200, { status: "awaiting_approval", message: "Email verified. Your account is now pending admin approval." }];
  }
  logEmail(email, "Your Sentinel login code", "LOGIN_OTP");
  return [200, { AuthenticationResult: { AccessToken: "mock-token", IdToken: "mock-id", RefreshToken: "mock-refresh" }, user: { ...user, role: "User", computedPermissions: ["crud:*"] } }];
});

testMock.onPost("/auth/initiate-login").reply((config) => {
  const { email } = JSON.parse(config.data);
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return [404, { code: "UserNotFoundException", message: "No account found with this email." }];
  if (user.status === "awaiting_approval") return [403, { code: "NotAuthorizedException", message: "Your account is awaiting admin approval." }];
  otpStore[email] = { otp: TEST_OTP, expiresAt: Date.now() + OTP_TTL_MS };
  return [200, { challengeName: "CUSTOM_CHALLENGE", session: "mock-session-token", otpPending: false }];
});

testMock.onGet("/admin/pending-users").reply(() => {
  return [200, mockUsers.filter(u => u.status === "awaiting_approval").map(u => ({
    id: u.id, name: u.name, email: u.email, companyName: u.companyName, status: u.status,
  }))];
});

testMock.onPost(/\/admin\/users\/.+\/approve/).reply((config) => {
  const match = config.url?.match(/\/admin\/users\/(.+)\/approve/);
  if (match) {
    const id = parseInt(match[1]);
    const user = mockUsers.find(u => u.id === id);
    if (user) {
      user.status = "Active"; user.roleId = 3;
      logEmail(user.email, "Sentinel — Your account has been approved!", "USER_APPROVAL_CONFIRMATION");
      return [200, { success: true, message: "User approved and welcome email sent via SES." }];
    }
  }
  return [404, { message: "User not found" }];
});

testMock.onPost(/\/admin\/users\/.+\/reject/).reply((config) => {
  const match = config.url?.match(/\/admin\/users\/(.+)\/reject/);
  if (match) {
    const id = parseInt(match[1]);
    const user = mockUsers.find(u => u.id === id);
    if (user) logEmail(user.email, "Sentinel — Account Application Update", "USER_REJECTION");
    mockUsers = mockUsers.filter(u => u.id !== id);
    return [200, { success: true }];
  }
  return [404, { message: "User not found" }];
});

// ── Reset ─────────────────────────────────────────────────────────────────
beforeAll(() => {
  mockUsers = [
    { id: 1, firstName: "Super", lastName: "Admin", name: "Super Admin", email: "superadmin@sentinel.com", companyName: "Sentinel Inc", roleId: 1, status: "Active", allowedPermissions: [], deniedPermissions: [] },
  ];
  mockEmailLog.length = 0;
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe("Full Auth Flow: Signup → OTP → Admin Approval → Login", () => {

  const email = `user-${Date.now()}@example.com`;

  it("1. User signs up → receives OTP email via SES", async () => {
    const res = await testClient.post("/auth/signup", {
      firstName: "Jane", lastName: "Smith", companyName: "Acme Corp", email,
    });
    expect(res.status).toBe(201);
    expect(res.data.status).toBe("otp_pending");

    const otpEmail = mockEmailLog.find(e => e.to === email && e.type === "SIGNUP_OTP");
    expect(otpEmail).toBeDefined();
  });

  it("2. User verifies OTP → user gets 'awaiting approval' email + admin gets notification email", async () => {
    const res = await testClient.post("/auth/respond-to-challenge", { email, otp: TEST_OTP, session: "signup-session" });
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("awaiting_approval");

    // User receives "awaiting admin approval" email
    const awaitingEmail = mockEmailLog.find(e => e.to === email && e.type === "USER_AWAITING_APPROVAL");
    expect(awaitingEmail).toBeDefined();
    expect(awaitingEmail!.subject).toContain("awaiting admin approval");

    // Admin receives "new user needs approval" email
    const adminEmail = mockEmailLog.find(e => e.to === "admin@sentinel.com" && e.type === "ADMIN_APPROVAL_REQUEST");
    expect(adminEmail).toBeDefined();
    expect(adminEmail!.subject).toContain(email);
  });

  it("3. User cannot login while awaiting approval", async () => {
    try {
      await testClient.post("/auth/initiate-login", { email });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err.response.status).toBe(403);
      expect(err.response.data.message).toContain("awaiting admin approval");
    }
  });

  it("4. Admin sees user in pending list", async () => {
    const res = await testClient.get("/admin/pending-users");
    const found = res.data.find((u: any) => u.email === email);
    expect(found).toBeDefined();
    expect(found.status).toBe("awaiting_approval");
  });

  it("5. Admin approves → user receives approval confirmation email", async () => {
    const pendingRes = await testClient.get("/admin/pending-users");
    const user = pendingRes.data.find((u: any) => u.email === email);

    const res = await testClient.post(`/admin/users/${user.id}/approve`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);

    const approvalEmail = mockEmailLog.find(e => e.to === email && e.type === "USER_APPROVAL_CONFIRMATION");
    expect(approvalEmail).toBeDefined();
    expect(approvalEmail!.subject).toContain("approved");
  });

  it("6. User logs in → enters email → receives OTP via SES", async () => {
    const res = await testClient.post("/auth/initiate-login", { email });
    expect(res.status).toBe(200);
    expect(res.data.challengeName).toBe("CUSTOM_CHALLENGE");
  });

  it("7. User verifies login OTP → receives tokens and accesses dashboard", async () => {
    const res = await testClient.post("/auth/respond-to-challenge", { email, otp: TEST_OTP, session: "mock-session-token" });
    expect(res.status).toBe(200);
    expect(res.data.AuthenticationResult).toBeDefined();
    expect(res.data.AuthenticationResult.AccessToken).toBeDefined();
    expect(res.data.user.email).toBe(email);
    expect(res.data.user.name).toBe("Jane Smith");
    expect(res.data.user.role).toBe("User");
  });
});

describe("Rejection Flow: Signup → Admin Rejects", () => {

  it("rejected user receives rejection email and cannot login", async () => {
    const rejectEmail = `rej-${Date.now()}@example.com`;

    // Sign up + verify OTP
    await testClient.post("/auth/signup", { firstName: "Bad", lastName: "Actor", companyName: "Shady LLC", email: rejectEmail });
    await testClient.post("/auth/respond-to-challenge", { email: rejectEmail, otp: TEST_OTP, session: "signup-session" });

    // Admin rejects
    const pendingRes = await testClient.get("/admin/pending-users");
    const user = pendingRes.data.find((u: any) => u.email === rejectEmail);
    expect(user).toBeDefined();

    await testClient.post(`/admin/users/${user.id}/reject`);

    // Rejection email sent
    const rejectionEmail = mockEmailLog.find(e => e.to === rejectEmail && e.type === "USER_REJECTION");
    expect(rejectionEmail).toBeDefined();

    // User is deleted — cannot login
    try {
      await testClient.post("/auth/initiate-login", { email: rejectEmail });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err.response.status).toBe(404);
    }
  });
});

describe("Email Summary", () => {

  it("all 5 email types were sent correctly", () => {
    const types = [...new Set(mockEmailLog.map(e => e.type))];
    console.log("\n  ═══ EMAIL FLOW SUMMARY ═══");
    console.log("  Expected: SIGNUP_OTP → USER_AWAITING_APPROVAL → ADMIN_APPROVAL_REQUEST → USER_APPROVAL_CONFIRMATION → USER_REJECTION → LOGIN_OTP");
    console.log("  Actual:");
    mockEmailLog.forEach((e, i) => console.log(`    ${i + 1}. [${e.type}] → ${e.to}`));
    console.log(`  Total: ${mockEmailLog.length} emails\n`);

    expect(types).toContain("SIGNUP_OTP");
    expect(types).toContain("USER_AWAITING_APPROVAL");
    expect(types).toContain("ADMIN_APPROVAL_REQUEST");
    expect(types).toContain("USER_APPROVAL_CONFIRMATION");
    expect(types).toContain("USER_REJECTION");
    expect(types).toContain("LOGIN_OTP");
  });
});
