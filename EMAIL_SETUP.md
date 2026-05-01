# Email Setup Guide

TechFlash sends automated emails for key events. Configure your mailer to deliver them.

## Email Events

Live transactional automations currently in the app:

- Welcome email (new user signup)
- Password reset instructions (self-service + admin setup/provisioning paths)
- Job posted (company notice)
- Job claimed (company notice)
- Payment confirmation (company, paid claims)
- Technician claimed job confirmation
- Job completed notices (company + technician)
- New message notification (job-thread conversations)
- Payment received (technician)
- Review received
- Review reminder (scheduled task)
- Job issue report (admin notice)
- Admin feedback/suggestion report
- Counter-offer updates (received, accepted, declined, countered)

Implemented but currently inactive:

- `job_accepted_email` (mailer exists but no active trigger)

---

## Quick Start (Development)

### Option A: Mailtrap (recommended for dev)

1. Sign up at [mailtrap.io](https://mailtrap.io) (free).
2. Go to **Email Testing** → **Inboxes** → select your inbox → **SMTP Settings**.
3. Add to `skilled_hub_api/.env`:

```
MAILER_FROM=noreply@techflash.local
SMTP_ADDRESS=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USERNAME=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
```

4. Restart Rails. Emails will appear in your Mailtrap inbox. (SMTP is already configured in `development.rb` when these env vars are set.)

**Important:** These values come from **Email Testing** → **Integration** → **SMTP**. The hostname **`sandbox.smtp.mailtrap.io`** is only for catching mail inside Mailtrap’s testing inbox. It is **not** the same as Mailtrap’s **Email Sending** / transactional delivery. Do **not** copy this sandbox host into production (e.g. Railway): the API may accept sends, but behavior and credentials are for the testing product. Production should use **Mailtrap HTTP** with a Sending API token, or **live SMTP** (`live.smtp.mailtrap.io`) with **Sending** SMTP credentials—not the sandbox hostname.

---

### Option B: Letter Opener (open emails in browser)

1. Add to `skilled_hub_api/Gemfile` (in the development group):

```ruby
gem 'letter_opener'
```

2. Run `bundle install`.

3. Add to `skilled_hub_api/config/environments/development.rb`:

```ruby
config.action_mailer.delivery_method = :letter_opener
config.action_mailer.perform_deliveries = true
```

4. Restart Rails. Emails will open in your browser when sent.

---

### Option C: Gmail (real delivery)

1. Enable 2FA on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Add to `skilled_hub_api/.env`:

```
MAILER_FROM=your@gmail.com
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

4. Restart Rails. (SMTP is already configured in `development.rb` when these env vars are set.)

---

## Production

### Mailtrap in production

If you use Mailtrap for real delivery, configure **Email Sending** (transactional), not the Email Testing sandbox:

- **Recommended:** HTTP API — set `MAILTRAP_USE_HTTP=true` and `MAILTRAP_API_TOKEN` to a token from **Sending** in the Mailtrap dashboard (see [Mailtrap HTTP Mode](#mailtrap-http-mode-optional-in-production) below). Do not reuse the testing inbox password as if it were the Sending token unless Mailtrap documents that for your account.
- **Alternative:** Live SMTP — use host **`live.smtp.mailtrap.io`** (and the SMTP username/password from **Sending**), not `sandbox.smtp.mailtrap.io`.

If production still had `SMTP_ADDRESS=sandbox.smtp.mailtrap.io`, switch to HTTP mode or live SMTP and matching Sending credentials; sandbox SMTP is for dev/testing capture only.

### Other providers

Use a transactional email service (SendGrid, Mailgun, Amazon SES, etc.) and set:

```
MAILER_FROM=noreply@yourdomain.com
SMTP_ADDRESS=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

Configure `config/environments/production.rb` with the same SMTP settings block.

---

## Mailtrap HTTP Mode (optional in production)

The app can also deliver through Mailtrap Transactional HTTP API.

Set:

```
MAILTRAP_USE_HTTP=true
MAILTRAP_API_TOKEN=your_mailtrap_token
MAILER_FROM=noreply@yourdomain.com
```

If `MAILTRAP_USE_HTTP=true`, the app requires either `MAILTRAP_API_TOKEN` or `SMTP_PASSWORD` (used as a token fallback).

---

## Background Jobs

Transactional emails are sent inline through `MailDelivery.safe_deliver` using `deliver_now`.
If delivery fails, the app logs an error and continues request handling.

---

## Review Reminders (scheduled task)

Run daily via cron or a scheduler:

```bash
cd skilled_hub_api && bundle exec rake skilled_hub:review_reminders
```

Example cron (daily at 9am):

```
0 9 * * * cd /path/to/skilled_hub_api && bundle exec rake skilled_hub:review_reminders
```

---

## Verification Checklist (Mailtrap + Triggers)

Use this sequence to verify setup and delivery:

1. **Check admin audit panel**
   - Open `Settings` -> `System controls` -> `Mailtrap`.
   - Confirm delivery mode and required env flags show as present.

2. **Connection-level test**
   - Rails task:
     - `cd skilled_hub_api && bundle exec rake mail:test_smtp`
   - Optional direct SMTP ping (no Rails mailer):
     - `cd skilled_hub_api && ruby script/mailtrap_smtp_ping.rb`
   - Confirm these test messages arrive in Mailtrap.

3. **Trigger-level tests**
   - Perform in-app actions and confirm matching emails appear in Mailtrap:
     - signup -> welcome
     - forgot password -> reset
     - create job -> job posted
     - claim job -> claimed + technician confirmation (+ payment confirmation when paid)
     - finish job -> completion notices
     - send job-thread message -> new message
     - submit review -> review received
     - run `bundle exec rake skilled_hub:review_reminders` -> reminder emails
     - counter-offer create/accept/decline/counter -> respective notifications

4. **If emails do not appear**
   - Check API logs for `[mail]` lines from `MailDelivery.safe_deliver`.
   - Verify `MAILER_FROM`, provider mode vars, and provider credentials.
   - Re-run connection tests before re-testing triggers.
