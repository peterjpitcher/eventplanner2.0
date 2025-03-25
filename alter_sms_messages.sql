-- Add message_sid column to sms_messages table
ALTER TABLE sms_messages ADD COLUMN IF NOT EXISTS message_sid TEXT;

-- Comment explaining the purpose
COMMENT ON COLUMN sms_messages.message_sid IS 'Twilio message SID for status tracking'; 