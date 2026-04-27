module Jobs
  class ClaimJobService
    def self.call(job:, technician_user:, offer: nil)
      new(job: job, technician_user: technician_user, offer: offer).call
    end

    def initialize(job:, technician_user:, offer: nil)
      @job = job
      @technician_user = technician_user
      @offer = offer
    end

    def call
      return { error: "Only technicians can claim jobs" } unless @technician_user.technician?
      return { error: "Job is no longer available" } unless @job.open?

      technician_profile = @technician_user.technician_profile || create_default_technician_profile!

      if technician_profile && !MembershipPolicy.job_visible_to_technician?(job: @job, technician_profile: technician_profile)
        return { error: "This job is not available for your tier yet.", status: :forbidden }
      end

      apply_offer_terms! if @offer.present?
      ensure_schedule_for_start_mode!
      return { error: schedule_error_message } if schedule_invalid?
      return { error: "Job has already been claimed" } if @job.job_applications.accepted.any?
      return { error: overlap_error_message } if overlapping_claim?(technician_profile)

      job_application = JobApplication.create!(
        job: @job,
        technician_profile: technician_profile,
        status: :accepted
      )

      charge_required = @job.job_amount_cents > 0 && !MembershipPolicy.billing_exempt?(@job.company_profile)
      if charge_required
        result = PaymentService.charge_company_on_claim(@job)
        if result[:error]
          job_application.destroy!
          @job.reload
          return { error: result[:error] }
        end
        @job.update!(status: :filled)
        MailDelivery.safe_deliver do
          UserMailer.job_claimed_email(@job).deliver_now
          UserMailer.payment_confirmation_email(@job, @job.company_charge_cents).deliver_now
          UserMailer.technician_claimed_job_email(@job).deliver_now
        end
      else
        @job.update!(status: :filled)
        MailDelivery.safe_deliver do
          UserMailer.job_claimed_email(@job).deliver_now
          UserMailer.technician_claimed_job_email(@job).deliver_now
        end
      end

      { job: @job }
    end

    private

    def create_default_technician_profile!
      TechnicianProfile.create!(
        user: @technician_user,
        trade_type: "General",
        experience_years: 0,
        availability: "Full-time"
      )
    end

    def apply_offer_terms!
      @job.assign_attributes(
        hourly_rate_cents: @offer.proposed_hourly_rate_cents,
        hours_per_day: @offer.proposed_hours_per_day,
        days: @offer.proposed_days,
        start_mode: @offer.proposed_start_mode,
        scheduled_start_at: @offer.proposed_start_at,
        scheduled_end_at: @offer.proposed_end_at
      )
      @job.save!
    end

    def ensure_schedule_for_start_mode!
      return if @job.hard_start?

      start_at = Time.current
      @job.scheduled_start_at = start_at
      @job.scheduled_end_at ||= derived_end_at(start_at)
      @job.save!
    end

    def derived_end_at(start_at)
      days = [@job.days.to_i, 1].max
      hours = [@job.hours_per_day.to_i, 1].max
      start_at + (days - 1).days + hours.hours
    end

    def schedule_invalid?
      @job.scheduled_start_at.blank? || @job.scheduled_end_at.blank?
    end

    def schedule_error_message
      "This job has no scheduled times. The company must set start and end times before technicians can claim it."
    end

    def overlapping_claim?(technician_profile)
      technician_profile.job_applications
        .joins(:job)
        .where(job_applications: { status: :accepted })
        .where(jobs: { status: [:reserved, :filled] })
        .where.not(jobs: { id: @job.id })
        .any? { |app| jobs_overlap?(app.job, @job) }
    end

    def overlap_error_message
      "You cannot claim this job because its scheduled time overlaps with another job you've already claimed."
    end

    def jobs_overlap?(job_a, job_b)
      return true if job_a.scheduled_start_at.blank? || job_a.scheduled_end_at.blank? || job_b.scheduled_start_at.blank? || job_b.scheduled_end_at.blank?

      start_a = job_a.scheduled_start_at
      end_a = job_a.scheduled_end_at
      start_b = job_b.scheduled_start_at
      end_b = job_b.scheduled_end_at
      start_a < end_b && end_a > start_b
    end
  end
end
