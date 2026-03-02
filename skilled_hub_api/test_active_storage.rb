#!/usr/bin/env ruby

# Test ActiveStorage configuration
puts "ActiveStorage Test"
puts "=================="

begin
  # Check if ActiveStorage is loaded
  puts "1. Checking ActiveStorage configuration..."
  if defined?(ActiveStorage)
    puts "   ✓ ActiveStorage is loaded"
  else
    puts "   ✗ ActiveStorage is not loaded"
  end

  # Check if Document model has file attachment
  puts "\n2. Checking Document model..."
  if Document.new.respond_to?(:file)
    puts "   ✓ Document model has file attachment"
  else
    puts "   ✗ Document model missing file attachment"
  end

  # Check if ActiveStorage tables exist
  puts "\n3. Checking ActiveStorage tables..."
  begin
    ActiveRecord::Base.connection.table_exists?('active_storage_attachments')
    puts "   ✓ ActiveStorage tables exist"
  rescue => e
    puts "   ✗ ActiveStorage tables missing: #{e.message}"
    puts "   Run: rails active_storage:install"
    puts "   Then: rails db:migrate"
  end

  puts "\n4. Testing file attachment..."
  begin
    doc = Document.new(uploadable_id: 1, uploadable_type: 'Job')
    puts "   ✓ Document can be created"
  rescue => e
    puts "   ✗ Document creation failed: #{e.message}"
  end

rescue => e
  puts "Error during testing: #{e.message}"
end

puts "\nTo fix ActiveStorage issues:"
puts "1. Run: rails active_storage:install"
puts "2. Run: rails db:migrate"
puts "3. Restart your Rails server" 