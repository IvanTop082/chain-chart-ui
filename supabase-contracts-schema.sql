-- Add contracts table to Supabase schema
-- Run this in your Supabase SQL Editor after the main schema

-- Contracts table for storing generated smart contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  contract_code TEXT NOT NULL,  -- C# source code
  nef_data BYTEA,  -- Compiled NEF file (binary)
  manifest_data JSONB,  -- Manifest JSON
  contract_hash TEXT,  -- Deployed contract hash (if deployed)
  tx_hash TEXT,  -- Deployment transaction hash
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'compiled', 'deployed', 'failed')),
  compile_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contracts_user_id_idx ON contracts(user_id);
CREATE INDEX IF NOT EXISTS contracts_project_id_idx ON contracts(project_id);
CREATE INDEX IF NOT EXISTS contracts_contract_name_idx ON contracts(contract_name);
CREATE INDEX IF NOT EXISTS contracts_created_at_idx ON contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts(status);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

