-- Add event_date and event_time columns to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_time TIME;

-- Add comments to document the new columns
COMMENT ON COLUMN items.event_date IS 'Date of the event (required for type=event)';
COMMENT ON COLUMN items.event_time IS 'Time of the event (optional for type=event)';
