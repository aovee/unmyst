// Branded magic-link emails. `sendVerificationRequest` (see auth.ts) picks the
// variant by whether the address already has an account: returning users get a
// "sign in" email, brand-new addresses get a "welcome / confirm" email.

type AuthEmailParams = {
  /** The magic link to embed (Auth.js callback URL with the token). */
  url: string
  /** Request host, shown in the footer for trust/context. */
  host: string
}

type RenderedEmail = { subject: string; html: string; text: string }

const APP_NAME = 'Unmyst'
const BRAND = '#41aea6'

function layout({
  heading,
  intro,
  buttonLabel,
  url,
  outro,
  host
}: {
  heading: string
  intro: string
  buttonLabel: string
  url: string
  outro: string
  host: string
}): string {
  // Table-based, inline styles — the lowest common denominator that renders
  // consistently across email clients (Gmail, Outlook, Apple Mail). The logo is
  // a PNG referenced by absolute URL (built from the magic link's origin, so it
  // points at the same host the user requested from); SVG isn't email-safe. The
  // `alt` keeps the brand name visible when images are blocked.
  const logoSrc = `${new URL(url).origin}/logo.png`
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e4e4e7;">
            <tr>
              <td style="padding-bottom:16px;">
                <img src="${logoSrc}" alt="${APP_NAME}" width="134" height="48" style="display:block;width:134px;height:48px;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="font-size:18px;font-weight:600;color:#18181b;padding-bottom:12px;">${heading}</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:22px;color:#52525b;padding-bottom:24px;">${intro}</td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;">
                <a href="${url}" style="display:inline-block;background:${BRAND};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">${buttonLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:20px;color:#71717a;padding-bottom:8px;">${outro}</td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:18px;color:#a1a1aa;padding-top:16px;border-top:1px solid #f4f4f5;">
                Or paste this link into your browser:<br />
                <a href="${url}" style="color:${BRAND};word-break:break-all;">${url}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#a1a1aa;padding-top:24px;">
                If you didn't request this, you can safely ignore this email. Sent for ${host}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** Email for an address that already has an account. */
export function signInEmail({ url, host }: AuthEmailParams): RenderedEmail {
  const subject = `Sign in to ${APP_NAME}`
  return {
    subject,
    html: layout({
      heading: 'Sign in to your account',
      intro: `Click the button below to sign in to ${APP_NAME}. This link expires in 24 hours and can only be used once.`,
      buttonLabel: 'Sign in',
      url,
      outro:
        'For your security, this link works only in the browser you requested it from.',
      host
    }),
    text: `Sign in to ${APP_NAME}\n\nUse this link to sign in (expires in 24 hours, one-time use):\n${url}\n\nIf you didn't request this, you can ignore this email.`
  }
}

/** Email for a brand-new address (no account yet). */
export function signUpEmail({ url, host }: AuthEmailParams): RenderedEmail {
  const subject = `Welcome to ${APP_NAME} — confirm your email`
  return {
    subject,
    html: layout({
      heading: `Welcome to ${APP_NAME} 👋`,
      intro: `You're almost there. Confirm your email to finish creating your ${APP_NAME} account and start tracking your subscriptions. This link expires in 24 hours.`,
      buttonLabel: 'Confirm email & get started',
      url,
      outro:
        'Confirming your email creates your account — no password required.',
      host
    }),
    text: `Welcome to ${APP_NAME}!\n\nConfirm your email to finish creating your account (link expires in 24 hours):\n${url}\n\nIf you didn't request this, you can ignore this email.`
  }
}
