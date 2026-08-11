// Branded magic-link emails. `sendVerificationRequest` (see auth.ts) picks the
// variant by whether the address already has an account: returning users get a
// "sign in" email, brand-new addresses get a "welcome / confirm" email.
//
// The HTML/text body lives in the `MagicLinkEmail` template (app/emails); these
// helpers just supply the per-variant copy and render it via nuxt-email-renderer.

type AuthEmailParams = {
  /** The magic link to embed (Auth.js callback URL with the token). */
  url: string
  /** Request host, shown in the footer for trust/context. */
  host: string
}

type RenderedEmail = {
  subject: string
  html: string
  text: string
}

type MagicLinkProps = {
  heading: string
  intro: string
  buttonLabel: string
  url: string
  outro: string
  host: string
}

const APP_NAME = 'Unmyst'

/** Render the shared template into an HTML + plain-text pair. */
async function renderMagicLink(props: MagicLinkProps): Promise<{ html: string, text: string }> {
  const [html, text] = await Promise.all([
    renderEmailComponent('MagicLinkEmail', props),
    renderEmailComponent('MagicLinkEmail', props, { plainText: true })
  ])
  // The template has no <ESubject>, so both calls resolve to plain strings.
  return {
    html: typeof html === 'string' ? html : html.html,
    text: typeof text === 'string' ? text : text.html
  }
}

/** Email for an address that already has an account. */
export async function signInEmail({ url, host }: AuthEmailParams): Promise<RenderedEmail> {
  return {
    subject: `Sign in to ${APP_NAME}`,
    ...(await renderMagicLink({
      heading: 'Sign in to your account',
      intro: `Click the button below to sign in to ${APP_NAME}. This link expires in 24 hours and can only be used once.`,
      buttonLabel: 'Sign in',
      url,
      outro:
        'For your security, this link works only in the browser you requested it from.',
      host
    }))
  }
}

/** Email for a brand-new address (no account yet). */
export async function signUpEmail({ url, host }: AuthEmailParams): Promise<RenderedEmail> {
  return {
    subject: `Welcome to ${APP_NAME} — confirm your email`,
    ...(await renderMagicLink({
      heading: `Welcome to ${APP_NAME} 👋`,
      intro: `You're almost there. Confirm your email to finish creating your ${APP_NAME} account and start tracking your subscriptions. This link expires in 24 hours.`,
      buttonLabel: 'Confirm email & get started',
      url,
      outro:
        'Confirming your email creates your account — no password required.',
      host
    }))
  }
}
