-- Add reminder tracking columns to bookings table
ALTER TABLE IF EXISTS "public"."bookings" 
  ADD COLUMN IF NOT EXISTS "reminder_7day_sent" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reminder_24hr_sent" BOOLEAN DEFAULT false;

-- Add reminder message types to message_type enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type 
                  JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
                  WHERE pg_type.typname = 'sms_message_type' 
                  AND pg_namespace.nspname = 'public') THEN
    CREATE TYPE "public"."sms_message_type" AS ENUM ('booking_confirmation', 'booking_cancellation', 'event_cancellation', 'reminder_7day', 'reminder_24hr');
  ELSE 
    -- Check if the enum values already exist before adding them
    BEGIN
      ALTER TYPE "public"."sms_message_type" ADD VALUE IF NOT EXISTS 'reminder_7day';
      EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
      ALTER TYPE "public"."sms_message_type" ADD VALUE IF NOT EXISTS 'reminder_24hr';
      EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$; 