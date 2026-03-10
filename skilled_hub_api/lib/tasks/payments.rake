# frozen_string_literal: true

namespace :payments do
  desc 'Release held payments when eligible (both reviewed OR 72h since job finished)'
  task release_eligible: :environment do
    count = 0
    Job.where(status: :finished).where.not(finished_at: nil).find_each do |job|
      next unless job.payments.held.any?
      next unless PaymentService.release_eligible?(job)

      result = PaymentService.release_to_technician(job.payments.held.first)
      count += 1 if result[:success]
    end
    puts "Released #{count} payment(s)"
  end
end
