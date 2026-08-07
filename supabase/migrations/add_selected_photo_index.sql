-- Add column to track which photo index the user selected
ALTER TABLE items ADD COLUMN selected_photo_index INTEGER DEFAULT 0;
