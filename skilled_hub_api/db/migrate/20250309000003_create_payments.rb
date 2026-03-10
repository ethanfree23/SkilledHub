class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments do |t|
      t.references :job, null: false, foreign_key: true
      t.integer :amount_cents, null: false
      t.string :status, null: false, default: 'pending' # pending, held, released, failed, refunded
      t.string :stripe_payment_intent_id
      t.string :stripe_transfer_id
      t.datetime :held_at
      t.datetime :released_at

      t.timestamps
    end

    add_index :payments, :stripe_payment_intent_id
    add_index :payments, :status
  end
end
