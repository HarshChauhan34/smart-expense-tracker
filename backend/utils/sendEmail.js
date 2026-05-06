import nodemailer from "nodemailer";

const isMailConfigured = () => {
  return (
    process.env.MAIL_HOST &&
    process.env.MAIL_PORT &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS &&
    process.env.MAIL_FROM
  );
};

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const getOtpEmailHtml = ({ appName, title, subtitle, otp }) => `
  <div style="margin:0;padding:0;background:#f4f7fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #e8eef5;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px 28px;background:linear-gradient(135deg,#0f766e,#0b3b56);">
                <h1 style="margin:0;color:#ffffff;font-family:Segoe UI,Arial,sans-serif;font-size:22px;line-height:1.3;font-weight:700;">
                  ${appName}
                </h1>
                <p style="margin:8px 0 0 0;color:#d8f3ef;font-family:Segoe UI,Arial,sans-serif;font-size:13px;">
                  Secure Verification
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
                <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.35;">${title}</h2>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#334155;">${subtitle}</p>

                <div style="margin:0 0 18px 0;padding:16px;border:1px dashed #94a3b8;border-radius:12px;background:#f8fafc;text-align:center;">
                  <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#64748b;text-transform:uppercase;">
                    Your One-Time Password
                  </p>
                  <p style="margin:0;font-size:32px;line-height:1.2;letter-spacing:0.2em;font-weight:800;color:#0f172a;">
                    ${otp}
                  </p>
                </div>

                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#475569;">
                  This OTP expires in <strong>10 minutes</strong>.
                </p>
                <div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#475569;">
                    If you did not request this verification, you can safely ignore this email.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 24px 28px;border-top:1px solid #edf2f7;font-family:Segoe UI,Arial,sans-serif;">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">
                  This is an automated message from ${appName}. Please do not reply directly to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  if (!isMailConfigured()) {
    return { sent: false, reason: "MAIL_CONFIG_MISSING" };
  }

  const transporter = getTransporter();
  const appName = "SpendSense AI";
  const subject = `Reset your ${appName} password`;
  const previewText = "Use this secure link to reset your password.";

  const text = [
    `${appName} - Password Reset`,
    "",
    "We received a request to reset your password.",
    "Use the link below within 15 minutes:",
    resetLink,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="margin:0;padding:0;background:#f4f7fb;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        ${previewText}
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #e8eef5;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 8px 28px;background:linear-gradient(135deg,#0f766e,#0b3b56);">
                  <h1 style="margin:0;color:#ffffff;font-family:Segoe UI,Arial,sans-serif;font-size:22px;line-height:1.3;font-weight:700;">
                    ${appName}
                  </h1>
                  <p style="margin:8px 0 0 0;color:#d8f3ef;font-family:Segoe UI,Arial,sans-serif;font-size:13px;">
                    Account Security
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
                  <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.35;">
                    Reset your password
                  </h2>
                  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#334155;">
                    We received a request to reset your password. Click the button below to choose a new one.
                  </p>
                  <p style="margin:0 0 20px 0;font-size:14px;line-height:1.7;color:#475569;">
                    This secure link will expire in <strong>15 minutes</strong>.
                  </p>

                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0;">
                    <tr>
                      <td align="center" bgcolor="#0f766e" style="border-radius:10px;">
                        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;font-family:Segoe UI,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:#64748b;">
                    If the button does not work, copy and paste this URL into your browser:
                  </p>
                  <p style="margin:0 0 20px 0;word-break:break-all;font-size:12px;line-height:1.6;color:#0f766e;">
                    ${resetLink}
                  </p>

                  <div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#475569;">
                      If you did not request this reset, you can ignore this email. Your password will remain unchanged.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 28px 24px 28px;border-top:1px solid #edf2f7;font-family:Segoe UI,Arial,sans-serif;">
                  <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">
                    This is an automated message from ${appName}. Please do not reply directly to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

export const sendPhoneOtpEmail = async ({ to, otp }) => {
  if (!isMailConfigured()) {
    return { sent: false, reason: "MAIL_CONFIG_MISSING" };
  }

  const transporter = getTransporter();
  const appName = "SpendSense AI";
  const subject = `${appName} phone verification OTP`;

  const text = [
    `${appName} - Phone Verification`,
    "",
    `Your OTP is ${otp}.`,
    "It will expire in 10 minutes.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = getOtpEmailHtml({
    appName,
    title: "Verify your phone number",
    subtitle: "Use the OTP below to complete your phone verification.",
    otp,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

export const sendEmailOtpEmail = async ({ to, otp }) => {
  if (!isMailConfigured()) {
    return { sent: false, reason: "MAIL_CONFIG_MISSING" };
  }

  const transporter = getTransporter();
  const appName = "SpendSense AI";
  const subject = `${appName} email verification OTP`;

  const text = [
    `${appName} - Email Verification`,
    "",
    `Your OTP is ${otp}.`,
    "It will expire in 10 minutes.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = getOtpEmailHtml({
    appName,
    title: "Verify your email address",
    subtitle: "Use the OTP below to complete your email verification.",
    otp,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};
