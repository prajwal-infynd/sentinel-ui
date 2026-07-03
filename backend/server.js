require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
  AdminDeleteUserCommand,
  ListUsersCommand,
  AdminInitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const app = express();
app.use(cors());
app.use(express.json());

// Mount all auth routes under /api to match VITE_API_BASE_URL
const router = express.Router();
app.use("/api", router);

// ── AWS Clients ───────────────────────────────────────────────────────────

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  },
});

const ses = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  },
});

const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET;
const FROM_EMAIL = process.env.APP_FROM_EMAIL || "Support@27x.ai";

// ── SECRET_HASH helper (required when Cognito app client has a secret) ────

function computeSecretHash(username) {
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

// ── OTP store (in-memory, 10-minute TTL) ─────────────────────────────────

const otpStore = new Map(); // email -> { otp, expiresAt }
const OTP_TTL = 10 * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(email, otp, subject) {
  await ses.send(
    new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: {
            Data: `<div style="font-family:sans-serif;padding:24px;">
              <h2 style="color:#1e293b;">Sentinel Verification</h2>
              <p>Your one-time verification code is:</p>
              <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#4f46e5;padding:16px 0;">${otp}</p>
              <p style="color:#64748b;font-size:14px;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
            </div>`,
          },
          Text: { Data: `Your Sentinel verification code is: ${otp}. Expires in 10 minutes.` },
        },
      },
    })
  );
}

// ── Role mapping ──────────────────────────────────────────────────────────

const ROLES = {
  "Super Admin": { id: 1, basePermissions: ["admin:*"] },
  Owner: { id: 2, basePermissions: ["invite_user", "manage_subscription", "crud:*"] },
  User: { id: 3, basePermissions: ["crud:*"] },
  "Trial User": { id: 3, basePermissions: ["crud:*"] },
};

// ── LOGIN FLOW ────────────────────────────────────────────────────────────

// Step 1: POST /auth/initiate-login
router.post("/auth/initiate-login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    // Check if user exists in Cognito
    let cognitoUser;
    try {
      const { UserAttributes, UserStatus } = await cognito.send(
        new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
      );
      cognitoUser = { attributes: UserAttributes, status: UserStatus };
    } catch (err) {
      if (err.name === "UserNotFoundException") {
        return res.status(404).json({ code: "UserNotFoundException", message: "No account found with this email." });
      }
      throw err;
    }

    // Check user status
    const statusAttr = cognitoUser.attributes?.find((a) => a.Name === "custom:approval_status");
    const approvalStatus = statusAttr?.Value;

    if (approvalStatus === "awaiting_approval") {
      return res.status(403).json({ code: "NotAuthorizedException", message: "Your account is awaiting admin approval." });
    }

    if (cognitoUser.status === "UNCONFIRMED" || approvalStatus === "otp_pending") {
      // Email not yet verified — send OTP for confirmation
      const otp = generateOtp();
      otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL, purpose: "confirm" });
      await sendOtpEmail(email, otp, "Verify your Sentinel email");
      return res.json({ challengeName: "CUSTOM_CHALLENGE", session: "cognito-session", otpPending: true, message: "Your email is not yet verified. Please confirm your OTP." });
    }

    // Normal login — send OTP via SES
    const otp = generateOtp();
    otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL, purpose: "login" });
    await sendOtpEmail(email, otp, "Your Sentinel login code");
    return res.json({ challengeName: "CUSTOM_CHALLENGE", session: "cognito-session", otpPending: false });
  } catch (err) {
    console.error("[Auth] initiate-login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Step 2: POST /auth/respond-to-challenge
router.post("/auth/respond-to-challenge", async (req, res) => {
  const { email, otp, session } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const stored = otpStore.get(email);
  if (!stored) return res.status(400).json({ code: "CodeMismatchException", message: "OTP expired or not found. Please request a new one." });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ code: "ExpiredCodeException", message: "OTP has expired. Please request a new one." });
  }
  if (stored.otp !== otp) return res.status(400).json({ code: "CodeMismatchException", message: "Incorrect OTP. Please try again." });

  otpStore.delete(email);

  try {
    // If purpose was confirming signup
    if (stored.purpose === "confirm") {
      // Mark user as confirmed in Cognito
      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          UserAttributes: [{ Name: "custom:approval_status", Value: "awaiting_approval" }],
        })
      );

      // Get user name for emails
      const { UserAttributes } = await cognito.send(
        new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
      );
      const attrs = {};
      for (const a of UserAttributes || []) attrs[a.Name] = a.Value;
      const firstName = attrs.given_name || "there";
      const fullName = `${attrs.given_name || ""} ${attrs.family_name || ""}`.trim();
      const company = attrs["custom:company"] || "N/A";

      // Email 1: to user — "waiting for admin approval"
      await sendOtpEmail(email, "", "Sentinel — Your account is awaiting admin approval");
      await ses.send(
        new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: "Sentinel — Your account is awaiting admin approval" },
            Body: {
              Html: { Data: `<div style="font-family:sans-serif;padding:24px;"><h2 style="color:#1e293b;">Account Pending Approval</h2><p>Hi ${firstName},</p><p>Your email has been verified. Your account is now awaiting approval from an administrator.</p><p>You will receive a confirmation email once your account is approved.</p><p style="color:#64748b;font-size:14px;margin-top:24px;">Best regards,<br/>The Sentinel Team</p></div>` },
              Text: { Data: `Hi ${firstName}, Your email has been verified. Your account is now awaiting admin approval. You will receive a confirmation email once approved.` },
            },
          },
        })
      );

      // Email 2: to admin — "new user needs approval"
      await ses.send(
        new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: ["prajwalgenious@gmail.com"] },
          Message: {
            Subject: { Data: `[Sentinel] New user awaiting approval: ${email}` },
            Body: {
              Html: { Data: `<div style="font-family:sans-serif;padding:24px;"><h2 style="color:#1e293b;">New User Awaiting Approval</h2><p>A new user has registered and verified their email:</p><table style="border-collapse:collapse;margin:16px 0;"><tr><td style="padding:4px 12px;font-weight:bold;">Name:</td><td>${fullName}</td></tr><tr><td style="padding:4px 12px;font-weight:bold;">Email:</td><td>${email}</td></tr><tr><td style="padding:4px 12px;font-weight:bold;">Company:</td><td>${company}</td></tr></table><p><a href="http://localhost:8080/admin" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Review in Admin Portal</a></p></div>` },
              Text: { Data: `New user awaiting approval: ${fullName} (${email}) from ${company}. Review at http://localhost:8080/admin` },
            },
          },
        })
      );

      console.log(`[SES] Awaiting-approval email sent to: ${email}`);
      console.log(`[SES] Admin notification sent for: ${email}`);
      return res.json({ status: "awaiting_approval", message: "Email verified. Your account is now pending admin approval." });
    }

    // For login — get user from Cognito and return tokens
    const { UserAttributes } = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
    );

    const attrMap = {};
    for (const attr of UserAttributes) {
      attrMap[attr.Name] = attr.Value;
    }

    const approvalStatus = attrMap["custom:approval_status"];
    if (approvalStatus === "awaiting_approval") {
      return res.json({ status: "awaiting_approval", message: "Your account is pending admin approval." });
    }

    const roleName = attrMap["custom:role"] || "User";
    const roleDef = ROLES[roleName] || ROLES["User"];

    const user = {
      id: parseInt(attrMap["custom:user_id"] || "0"),
      firstName: attrMap.given_name || "",
      lastName: attrMap.family_name || "",
      name: `${attrMap.given_name || ""} ${attrMap.family_name || ""}`.trim(),
      companyName: attrMap["custom:company"] || "",
      email: email,
      roleId: roleDef.id,
      role: roleName,
      status: "Active",
      tokensUsed: "0",
      cost: "$0.00",
      computedPermissions: roleDef.basePermissions,
    };

    return res.json({
      AuthenticationResult: {
        AccessToken: "cognito-access-token-" + Date.now(),
        IdToken: "cognito-id-token-" + Date.now(),
        RefreshToken: "cognito-refresh-token-" + Date.now(),
      },
      user,
    });
  } catch (err) {
    console.error("[Auth] respond-to-challenge error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ── SIGNUP FLOW ───────────────────────────────────────────────────────────

// Step 1: POST /auth/signup
router.post("/auth/signup", async (req, res) => {
  const { firstName, lastName, companyName, email } = req.body;
  if (!email || !firstName) return res.status(400).json({ message: "Email and first name required" });

  const secretHash = computeSecretHash(email);

  try {
    // Check if user already exists
    try {
      const existing = await cognito.send(
        new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
      );
      const statusAttr = existing.UserAttributes?.find((a) => a.Name === "custom:approval_status");
      if (statusAttr?.Value === "otp_pending") {
        // Resend OTP
        const otp = generateOtp();
        otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL, purpose: "confirm" });
        await sendOtpEmail(email, otp, "Verify your Sentinel email");
        return res.json({ status: "otp_pending", deliveryMedium: "EMAIL", destination: email.replace(/(.{2}).*(@.*)/, "$1***$2") });
      }
      return res.status(400).json({ code: "UsernameExistsException", message: "An account with this email already exists." });
    } catch (err) {
      if (err.name !== "UserNotFoundException") throw err;
    }

    // Create user in Cognito
    await cognito.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: crypto.randomBytes(24).toString("base64"), // random password — user logs in via OTP
        SecretHash: secretHash,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "given_name", Value: firstName },
          { Name: "family_name", Value: lastName || "" },
          { Name: "custom:company", Value: companyName || "" },
          { Name: "custom:approval_status", Value: "otp_pending" },
          { Name: "custom:user_id", Value: String(Date.now()) },
          { Name: "custom:role", Value: "User" },
        ],
      })
    );

    // Generate and send OTP via SES
    const otp = generateOtp();
    otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL, purpose: "confirm" });
    await sendOtpEmail(email, otp, "Verify your Sentinel email");

    return res.status(201).json({
      status: "otp_pending",
      deliveryMedium: "EMAIL",
      destination: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
    });
  } catch (err) {
    console.error("[Auth] signup error:", err);
    return res.status(500).json({ message: err.message || "Signup failed" });
  }
});

// POST /auth/resend-otp
router.post("/auth/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    // Verify user exists
    await cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email }));

    const otp = generateOtp();
    otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL, purpose: "confirm" });
    await sendOtpEmail(email, otp, "Your Sentinel verification code");

    return res.json({ status: "otp_sent", deliveryMedium: "EMAIL", destination: email.replace(/(.{2}).*(@.*)/, "$1***$2") });
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      return res.status(404).json({ code: "UserNotFoundException", message: "User not found." });
    }
    console.error("[Auth] resend-otp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /auth/notify-admin
router.post("/auth/notify-admin", async (req, res) => {
  const { email } = req.body;
  try {
    await ses.send(
      new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: ["prajwalgenious@gmail.com"] },
        Message: {
          Subject: { Data: "[Sentinel] New user awaiting approval" },
          Body: {
            Html: { Data: `<p>User <strong>${email}</strong> has verified their email and is awaiting admin approval.</p><p><a href="http://localhost:8080/admin">Review in Admin Portal</a></p>` },
            Text: { Data: `User ${email} is awaiting approval. Review at http://localhost:8080/admin` },
          },
        },
      })
    );
    console.log(`[SES] Admin notification sent for: ${email}`);
    return res.json({ status: "notification_sent", medium: "SES", recipient: FROM_EMAIL });
  } catch (err) {
    console.error("[SES] Admin notification failed:", err);
    return res.json({ status: "notification_sent", medium: "SES" }); // non-blocking
  }
});

// ── ADMIN ENDPOINTS ───────────────────────────────────────────────────────

// GET /admin/pending-users
router.get("/admin/pending-users", async (req, res) => {
  try {
    const { Users } = await cognito.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: 'status = "UNCONFIRMED"',
        Limit: 50,
      })
    );

    const pending = (Users || [])
      .map((u) => {
        const attrs = {};
        for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
        return {
          id: attrs["custom:user_id"] || u.Username,
          name: `${attrs.given_name || ""} ${attrs.family_name || ""}`.trim(),
          firstName: attrs.given_name || "",
          lastName: attrs.family_name || "",
          email: attrs.email || u.Username,
          companyName: attrs["custom:company"] || "",
          status: attrs["custom:approval_status"] || u.UserStatus,
          role: attrs["custom:role"] || "User",
        };
      })
      .filter((u) => u.status === "awaiting_approval" || u.status === "otp_pending");

    return res.json(pending);
  } catch (err) {
    console.error("[Admin] pending-users error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/users
router.get("/admin/users", async (req, res) => {
  try {
    const { Users } = await cognito.send(
      new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
    );

    const users = (Users || []).map((u) => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      const roleName = attrs["custom:role"] || "User";
      const roleDef = ROLES[roleName] || ROLES["User"];
      return {
        id: attrs["custom:user_id"] || u.Username,
        name: `${attrs.given_name || ""} ${attrs.family_name || ""}`.trim(),
        email: attrs.email || u.Username,
        companyName: attrs["custom:company"] || "",
        tokensUsed: "0",
        cost: "$0.00",
        status: u.UserStatus === "CONFIRMED" ? "Active" : attrs["custom:approval_status"] || u.UserStatus,
        role: roleName,
        computedPermissions: roleDef.basePermissions,
      };
    });

    return res.json(users);
  } catch (err) {
    console.error("[Admin] list-users error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/:id/approve
router.post("/admin/users/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    // Find user by custom:user_id
    const { Users } = await cognito.send(
      new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
    );
    const target = (Users || []).find((u) => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      return attrs["custom:user_id"] === id || u.Username === id;
    });

    if (!target) return res.status(404).json({ message: "User not found" });
    const username = target.Username;

    // Enable user and update attributes
    await cognito.send(new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
    await cognito.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: [
          { Name: "custom:approval_status", Value: "approved" },
          { Name: "custom:role", Value: "User" },
        ],
      })
    );

    // Send welcome email
    const emailAttr = target.Attributes?.find((a) => a.Name === "email");
    if (emailAttr?.Value) {
      await ses.send(
        new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [emailAttr.Value] },
          Message: {
            Subject: { Data: "Welcome to Sentinel!" },
            Body: {
              Html: { Data: `<div style="font-family:sans-serif;padding:24px;"><h2 style="color:#1e293b;">Welcome to Sentinel</h2><p>Your account has been approved. You can now log in and start monitoring.</p><p><a href="http://localhost:8080/login" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Log In</a></p></div>` },
              Text: { Data: "Your Sentinel account has been approved. Log in at http://localhost:8080/login" },
            },
          },
        })
      );
    }

    return res.json({ success: true, message: "User approved and welcome email sent via SES." });
  } catch (err) {
    console.error("[Admin] approve error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/:id/reject
router.post("/admin/users/:id/reject", async (req, res) => {
  const { id } = req.params;
  try {
    const { Users } = await cognito.send(
      new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
    );
    const target = (Users || []).find((u) => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      return attrs["custom:user_id"] === id || u.Username === id;
    });

    if (!target) return res.status(404).json({ message: "User not found" });

    await cognito.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: target.Username }));
    return res.json({ success: true });
  } catch (err) {
    console.error("[Admin] reject error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /admin/users/:id/status
router.patch("/admin/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { Users } = await cognito.send(
      new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
    );
    const target = (Users || []).find((u) => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      return attrs["custom:user_id"] === id || u.Username === id;
    });

    if (!target) return res.status(404).json({ message: "User not found" });

    if (status === "Suspended") {
      await cognito.send(new AdminDisableUserCommand({ UserPoolId: USER_POOL_ID, Username: target.Username }));
    } else if (status === "Active") {
      await cognito.send(new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: target.Username }));
    }

    await cognito.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: target.Username,
        UserAttributes: [{ Name: "custom:approval_status", Value: status === "Active" ? "approved" : status.toLowerCase() }],
      })
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("[Admin] update-status error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /admin/users/:id
router.delete("/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { Users } = await cognito.send(
      new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60 })
    );
    const target = (Users || []).find((u) => {
      const attrs = {};
      for (const a of u.Attributes || []) attrs[a.Name] = a.Value;
      return attrs["custom:user_id"] === id || u.Username === id;
    });

    if (!target) return res.status(404).json({ message: "User not found" });

    await cognito.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: target.Username }));
    return res.json({ success: true });
  } catch (err) {
    console.error("[Admin] delete-user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/invite
router.post("/admin/users/invite", async (req, res) => {
  const { name, email, roleId } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const roleName = Object.values(ROLES).find((r) => r.id === roleId)?.name || "User";

  try {
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
          { Name: "given_name", Value: name?.split(" ")[0] || email.split("@")[0] },
          { Name: "family_name", Value: name?.split(" ").slice(1).join(" ") || "" },
          { Name: "custom:approval_status", Value: "approved" },
          { Name: "custom:user_id", Value: String(Date.now()) },
          { Name: "custom:role", Value: roleName },
        ],
        DesiredDeliveryMediums: ["EMAIL"],
      })
    );

    return res.json({
      user: {
        id: Date.now(),
        name: name || email.split("@")[0],
        email,
        role: roleName,
        status: "Active",
        computedPermissions: (ROLES[roleName] || ROLES["User"]).basePermissions,
      },
    });
  } catch (err) {
    console.error("[Admin] invite error:", err);
    return res.status(500).json({ message: err.message || "Invite failed" });
  }
});

// ── Start server ──────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n  Sentinel Auth Backend running on http://localhost:${PORT}`);
  console.log(`  Cognito Pool: ${USER_POOL_ID}`);
  console.log(`  SES Region:   ${process.env.AWS_SES_REGION}`);
  console.log(`  From Email:   ${FROM_EMAIL}\n`);
});
