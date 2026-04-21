-- CMS Tables for Green Legacy Admin Dashboard

-- 1. Impact Stories Table
CREATE TABLE IF NOT EXISTS impact_stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  location text NOT NULL,
  excerpt text NOT NULL,
  image_url text,
  status text DEFAULT 'Published',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view published impact stories"
ON impact_stories FOR SELECT
USING (status = 'Published');

-- Allow authenticated users (Admins) to insert/update/delete
CREATE POLICY "Admins can insert impact stories" ON impact_stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update impact stories" ON impact_stories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete impact stories" ON impact_stories FOR DELETE USING (auth.role() = 'authenticated');

-- Insert dummy data so it's not empty instantly
INSERT INTO impact_stories (title, location, excerpt) VALUES
('From Barren Land to Green Campus', 'Tamil Nadu Agricultural University', 'How 500 trees transformed the campus landscape and created a biodiversity corridor that now hosts 23 bird species.'),
('A Father''s Legacy Lives On', 'Anand, Gujarat', 'Rajesh planted 25 trees in memory of his father. Two years later, the small grove has become a community gathering space.'),
('Corporate Impact at Scale', 'TechCorp India, Bengaluru', '500 trees across 5 colleges. Their CSR initiative engaged 200 employees in planting drives and environmental education.'),
('Student-Led Green Revolution', 'Punjab Agricultural University', 'Campus ambassadors organized 12 planting drives, involving over 1,000 students and establishing a model sustainability program.')
ON CONFLICT DO NOTHING;
