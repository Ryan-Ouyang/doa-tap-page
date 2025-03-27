-- Create schema for Department of Agriculture Tap Page application

-- Table for tracking NFC chips
CREATE TABLE chips (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,  -- Unique identifier from the IYK API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_tap_at TIMESTAMP WITH TIME ZONE
);

-- Table for tracking reward periods
CREATE TABLE reward_periods (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,  -- NULL if still active
  created_by TEXT,  -- Admin who started the period
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking claims
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  chip_id INTEGER REFERENCES chips(id) NOT NULL,
  reward_period_id INTEGER REFERENCES reward_periods(id) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a chip can only claim once per reward period
  UNIQUE(chip_id, reward_period_id)
);

-- Table for admin users (for the password-gated admin page)
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- Store hashed passwords, never plaintext
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chips_uid ON chips(uid);
CREATE INDEX idx_reward_periods_active ON reward_periods(started_at, ended_at);
CREATE INDEX idx_claims_chip_id ON claims(chip_id);
CREATE INDEX idx_claims_reward_period_id ON claims(reward_period_id);
