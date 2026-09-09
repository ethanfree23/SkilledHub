# frozen_string_literal: true

class CreatePasswordSetupChallenges < ActiveRecord::Migration[7.1]
  def change
    create_table :password_setup_challenges do |t|
      t.references :user, null: false, foreign_key: true
      t.string :public_id, null: false
      t.string :code_digest, null: false
      t.string :verification_token_digest
      t.datetime :expires_at, null: false
      t.datetime :verified_at
      t.datetime :consumed_at
      t.integer :attempt_count, null: false, default: 0
      t.datetime :last_sent_at
      t.string :request_ip
      t.timestamps
    end

    add_index :password_setup_challenges, :public_id, unique: true
    add_index :password_setup_challenges, :expires_at
    add_index :password_setup_challenges, :consumed_at

    create_table :auth_rate_limits do |t|
      t.string :scope, null: false
      t.string :bucket, null: false
      t.integer :count, null: false, default: 0
      t.datetime :window_starts_at, null: false
      t.timestamps
    end

    add_index :auth_rate_limits, %i[scope bucket window_starts_at], name: "index_auth_rate_limits_on_scope_bucket_window"
  end
end
