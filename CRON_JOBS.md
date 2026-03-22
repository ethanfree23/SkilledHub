# Cron Jobs

Schedule these rake tasks so payments release and review reminders work correctly in production.

## 1. Payment Release (hourly)

Releases held payments to technicians when eligible (both reviewed OR 72h since job finished).

```bash
cd /path/to/skilled_hub_api && bundle exec rails payments:release_eligible
```

**Example crontab (hourly):**
```
0 * * * * cd /path/to/skilled_hub_api && bundle exec rails payments:release_eligible
```

## 2. Review Reminders (daily)

Sends reminder emails to users who completed jobs 3–7 days ago but haven't left a review.

```bash
cd /path/to/skilled_hub_api && bundle exec rake skilled_hub:review_reminders
```

**Example crontab (daily at 9am):**
```
0 9 * * * cd /path/to/skilled_hub_api && bundle exec rake skilled_hub:review_reminders
```

---

## Railway / Heroku / Other Hosts

- **Railway**: Use a cron add-on or scheduled worker.
- **Heroku**: Add Heroku Scheduler and create two daily jobs; for hourly payments, use a third-party cron service.
- **Render / Fly.io**: Configure cron jobs in their dashboard or use a separate cron service (e.g. cron-job.org) to hit a protected endpoint if you add one.
