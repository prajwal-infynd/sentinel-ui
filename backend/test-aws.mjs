import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  SESClient,
  GetIdentityVerificationAttributesCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

const REGION_COGNITO = process.env.AWS_COGNITO_REGION;
const REGION_SES = process.env.AWS_SES_REGION;
const ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;
const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
const FROM_EMAIL = process.env.APP_FROM_EMAIL || "Support@27x.ai";

const creds = {
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
};

let passed = 0;
let failed = 0;

function assert(description, ok, detail) {
  if (ok) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.log(`  ✗ ${description}`);
    console.log(`    ${detail || ""}`);
    failed++;
  }
}

console.log("\n══════════════════════════════════════════");
console.log("  AWS Cognito & SES Connectivity Test");
console.log("══════════════════════════════════════════\n");

console.log(`Cognito Region: ${REGION_COGNITO}`);
console.log(`SES Region:     ${REGION_SES}`);
console.log(`User Pool ID:   ${USER_POOL_ID}`);
console.log(`Client ID:      ${CLIENT_ID}`);
console.log(`From Email:     ${FROM_EMAIL}`);
console.log(`Access Key ID:  ${ACCESS_KEY ? ACCESS_KEY.substring(0, 8) + "..." : "MISSING"}`);
console.log("");

// ─── Test 1: Credentials exist ─────────────────────────────────────────
console.log("[1] Environment Configuration");
assert("AWS_COGNITO_REGION is set", !!REGION_COGNITO, "Missing AWS_COGNITO_REGION");
assert("AWS_SES_REGION is set", !!REGION_SES, "Missing AWS_SES_REGION");
assert("AWS_SES_ACCESS_KEY_ID is set", !!ACCESS_KEY, "Missing AWS_SES_ACCESS_KEY_ID");
assert("AWS_SES_SECRET_ACCESS_KEY is set", !!SECRET_KEY, "Missing AWS_SES_SECRET_ACCESS_KEY");
assert("AWS_COGNITO_USER_POOL_ID is set", !!USER_POOL_ID, "Missing AWS_COGNITO_USER_POOL_ID");
assert("AWS_COGNITO_CLIENT_ID is set", !!CLIENT_ID, "Missing AWS_COGNITO_CLIENT_ID");
assert("APP_FROM_EMAIL (sender) is set", !!FROM_EMAIL, "Missing APP_FROM_EMAIL");

// ─── Test 2: Cognito — List users ──────────────────────────────────────
console.log("\n[2] Amazon Cognito — ListUsers");
let cognitoOk = false;
let userCount = 0;
try {
  const cognito = new CognitoIdentityProviderClient({
    region: REGION_COGNITO,
    credentials: creds,
  });
  const cmd = new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Limit: 5,
  });
  const resp = await cognito.send(cmd);
  cognitoOk = true;
  userCount = resp.Users?.length || 0;
  assert("Cognito ListUsers succeeded", true, `Found ${userCount} user(s)`);

  if (userCount > 0) {
    const sampleUser = resp.Users[0];
    assert("User has Username", !!sampleUser.Username, `Username: ${sampleUser.Username}`);
    assert("User has Status", !!sampleUser.UserStatus, `Status: ${sampleUser.UserStatus}`);
    console.log(`  Sample: ${sampleUser.Username} — ${sampleUser.UserStatus} — ${sampleUser.UserCreateDate?.toISOString().split("T")[0]}`);
  }
} catch (err) {
  assert("Cognito ListUsers", false, `${err.name}: ${err.message}`);
}

// ─── Test 3: Cognito — AdminGetUser ──────────────────────────────────
if (cognitoOk && userCount > 0) {
  console.log("\n[3] Amazon Cognito — AdminGetUser");
  try {
    const cognito = new CognitoIdentityProviderClient({ region: REGION_COGNITO, credentials: creds });
    const listCmd = new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 1 });
    const listResp = await cognito.send(listCmd);
    const username = listResp.Users?.[0]?.Username;
    if (username) {
      const getCmd = new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username });
      const userResp = await cognito.send(getCmd);
      const emailAttr = userResp.UserAttributes?.find(a => a.Name === "email");
      assert("AdminGetUser succeeded", true, `Email: ${emailAttr?.Value || "N/A"}, Status: ${userResp.UserStatus}`);
    }
  } catch (err) {
    assert("AdminGetUser", false, `${err.name}: ${err.message}`);
  }
} else {
  console.log("\n[3] Skipping AdminGetUser — no users");
}

// ─── Test 4: SES — Identity check ─────────────────────────────────────
console.log("\n[4] Amazon SES — Sender Identity");
try {
  const ses = new SESClient({ region: REGION_SES, credentials: creds });
  const cmd = new GetIdentityVerificationAttributesCommand({ Identities: [FROM_EMAIL] });
  const resp = await ses.send(cmd);
  const attrs = resp.VerificationAttributes?.[FROM_EMAIL];
  if (attrs) {
    assert(`${FROM_EMAIL} verification status`, attrs.VerificationStatus === "Success", `Status: ${attrs.VerificationStatus}`);
  } else {
    assert(`${FROM_EMAIL} not found in SES`, false, "The sender email may not be verified");
  }
} catch (err) {
  assert("SES identity check", false, `${err.name}: ${err.message}`);
}

// ─── Test 5: SES — Send test email ─────────────────────────────────────
console.log("\n[5] Amazon SES — Send Test Email");
const TEST_TO = "prajwalgenious@gmail.com";
try {
  const ses = new SESClient({ region: REGION_SES, credentials: creds });
  const cmd = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [TEST_TO] },
    Message: {
      Subject: { Data: "[Sentinel Test] SES is working!", Charset: "UTF-8" },
      Body: {
        Html: {
          Data: `<h2>Sentinel SES Test</h2><p>If you're reading this, <strong style="color:green">SES is working</strong>.</p><hr><p><small>${new Date().toISOString()}</small></p>`,
          Charset: "UTF-8",
        },
      },
    },
  });
  await ses.send(cmd);
  assert("Test email sent", true, `To: ${TEST_TO}`);
} catch (err) {
  assert("Send email via SES", false, `${err.name}: ${err.message}`);
}

// ─── Summary ─────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed} tests`);
console.log("══════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
