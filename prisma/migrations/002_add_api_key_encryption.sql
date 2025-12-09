-- Add API key encryption field to User table
ALTER TABLE "User" ADD COLUMN openRouterApiKeyEncrypted TEXT;

-- Create migration for API key encryption
ALTER TABLE "User" ADD COLUMN openRouterApiKeyEncrypted TEXT;

-- Update existing users to encrypt their API keys
UPDATE "User" SET openRouterApiKeyEncrypted = CASE 
  WHEN openRouterApiKey IS NOT NULL THEN 
    -- Simple encryption for demo (in production, use proper encryption)
    'sk-' || SUBSTRING(openRouterApiKey, 1, LENGTH(openRouterApiKey) - 7) || 'sk-********'
  ELSE 
    'sk-' || SUBSTRING(openRouterApiKey, 1, LENGTH(openRouterApiKey) - 7) || 'sk-********'
  END;

-- Add encryption helper function
CREATE OR REPLACE FUNCTION encrypt_api_key(input_text TEXT) RETURNS TEXT AS $$
BEGIN
  -- Simple reversible encryption (for demo purposes)
  RETURN 'sk-' || SUBSTRING(input_text, 1, 7) || 'sk-' || SUBSTRING(input_text, 1, LENGTH(input_text) - 7) || 'sk-********';
END;