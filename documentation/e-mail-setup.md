# E-mail setup

Strapi sends admin transactional mail (password reset, admin user invitations) through
**Google Workspace SMTP**. Previously no provider was configured, so Strapi's default
`sendmail` provider only logged messages and nothing was delivered.

The public website sends its form notifications separately, through the **Gmail API** from
`scoutinglommel.be`. Different transport, same sending identity. See the
`scoutinglommel.be` repo (`docs/e-mail-setup.md`) for that half.

## Configuration

`config/plugins.js` configures the `email` plugin with the `nodemailer` provider:

```js
email: {
  config: {
    provider: "nodemailer",
    providerOptions: {
      host: env("SMTP_HOST", "smtp.gmail.com"),
      port: env.int("SMTP_PORT", 465),
      secure: env.bool("SMTP_SECURE", true),
      auth: { user: env("SMTP_USERNAME"), pass: env("SMTP_PASSWORD") },
    },
    settings: {
      defaultFrom: env("EMAIL_FROM", env("SMTP_USERNAME")),
      defaultReplyTo: env("EMAIL_REPLY_TO", env("EMAIL_FROM", env("SMTP_USERNAME"))),
    },
  },
}
```

The provider is pinned to the same minor as `@strapi/strapi` (`5.52.2`); a mismatch between
provider and core is not supported.

## Environment

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` (SSL) or `587` (STARTTLS) |
| `SMTP_SECURE` | `true` for port 465, `false` for 587 |
| `SMTP_USERNAME` | The Google Workspace mailbox that owns the app password |
| `SMTP_PASSWORD` | 16-character Google **app password** |
| `EMAIL_FROM` | From header; must be `SMTP_USERNAME` or a verified alias |
| `EMAIL_REPLY_TO` | Reply-To header |

Set them on the Strapi resource in **Coolify** (the deployment target is the Hetzner VPS, not
the Heroku setup in the old notes). Nothing is committed; `.env` stays local and `.env.example`
only carries the key names.

## App password

Google removed less-secure-app access in May 2025, so a normal Workspace password no longer
works for SMTP. Strapi's nodemailer provider only supports password auth, so an app password is
the only option:

1. Enable 2-Step Verification on the sender mailbox.
2. Google Account → Security → App passwords → create one for "Mail".
3. Store it as `SMTP_PASSWORD` in Coolify.

The app password is revoked whenever the account password changes; rotate it then.

## Sender identity

The chosen sender is **`noreply@scoutinglommel.be`**, added as an alternate email (alias) on the
authenticated mailbox. No separate subdomain: a subdomain would need its own secondary-domain
verification, MX, SPF and DKIM records, and would carry a young-domain reputation.

`EMAIL_FROM` must equal `SMTP_USERNAME` or a verified "Send mail as" alias on that mailbox.
Otherwise Gmail rewrites the `From:` header and DMARC alignment breaks.

## Limits

2,000 messages/day per mailbox, 100 recipients per message, 25 MB per message. Shared with the
website if both use the same mailbox.

`smtp-relay.gmail.com` (10,000 recipients/day, IP allowlist) is an option if volume grows; the
Hetzner server has a static IPv4, so it is viable here (not for the Vercel-hosted frontend).

## Verification

1. Deploy with the variables set.
2. `pnpm strapi console`, then:

   ```js
   await strapi.plugin("email").service("email").send({
     to: "you@scoutinglommel.be",
     subject: "SMTP test",
     text: "ok",
   });
   ```

3. In the admin panel, request a password reset from the login screen and confirm it arrives.
4. `Show original` on the received message: `spf=pass`, `dkim=pass`, `dmarc=pass` for
   `scoutinglommel.be`.

Strapi's users-permissions templates (registration confirmation, reset password for end users)
stay dormant: the website logs in with Google OAuth and has no Strapi end users. Only admin mail
uses this configuration today.
