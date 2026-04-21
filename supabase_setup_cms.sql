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

-- 2. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  text text NOT NULL,
  rating integer DEFAULT 5,
  status text DEFAULT 'Published',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins can insert testimonials" ON testimonials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update testimonials" ON testimonials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete testimonials" ON testimonials FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO testimonials (name, role, text, rating) VALUES
('Priya Sharma', 'Individual Donor', 'I planted 10 trees for my parents'' anniversary. The GPS certificate and growth updates made it the most meaningful gift I''ve ever given. Watching the trees grow through the app is truly special.', 5),
('Rajesh Kumar', 'CSR Head, TechCorp India', 'Green Legacy made our CSR initiative seamless. 500 trees planted, full documentation for compliance, and our employees loved the engagement events. The transparency is unmatched.', 5),
('Ananya Patel', 'Agriculture Student, TNAU', 'As a campus ambassador, I''ve gained incredible hands-on experience. The program bridges classroom learning with real-world impact. It''s changed how I see my career.', 5),
('Dr. Suresh Nair', 'College Dean, KAU', 'The partnership with Green Legacy has transformed our campus and provided unparalleled learning opportunities for students. A truly innovative model.', 5),
('Meera Joshi', 'Environmental Blogger', 'Finally, a tree planting organization that''s truly transparent. I can visit my trees, scan the QR code, and see exactly where my money went. This is how environmental work should be done.', 5)
ON CONFLICT DO NOTHING;

-- 3. Volunteer Events Table
CREATE TABLE IF NOT EXISTS volunteer_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  date text NOT NULL,
  location text NOT NULL,
  spots integer DEFAULT 50,
  status text DEFAULT 'Published',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published events" ON volunteer_events FOR SELECT USING (status = 'Published');
CREATE POLICY "Admins can manage events" ON volunteer_events USING (auth.role() = 'authenticated');

INSERT INTO volunteer_events (title, date, location, spots) VALUES
('Delhi Seedling Drive', '2026-11-05', 'Delhi Eco-Park', 25),
('Mumbai Coastal Plantation', '2026-11-12', 'Versova Beach Area', 100)
ON CONFLICT DO NOTHING;

-- 4. Global Settings Table (Key-Value configuration)
CREATE TABLE IF NOT EXISTS site_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage config" ON site_config USING (auth.role() = 'authenticated');

INSERT INTO site_config (key, value) VALUES
('hero_headline', 'Plant a Tree, Leave a Legacy.'),
('global_goal', '1000'),
('contact_email', 'hello@greenlegacy.in'),
('contact_phone', '+91 98765 43210')
ON CONFLICT DO NOTHING;

-- 5. FAQ Manager Table
CREATE TABLE IF NOT EXISTS faq_manager (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE faq_manager ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view FAQs" ON faq_manager FOR SELECT USING (true);
CREATE POLICY "Admins can manage FAQs" ON faq_manager USING (auth.role() = 'authenticated');

INSERT INTO faq_manager (question, answer, display_order) VALUES
('How does my tree plantation contribute to the environment?', 'Every tree planted through Green Legacy is a verified biological asset. One mature tree can absorb approximately 22kg of CO2 per year and produce enough oxygen for two people. Your contribution directly offsets carbon and restores local biodiversity.', 1),
('Can I visit my tree in person?', 'Yes! We encourage ''Physical Stewardship.'' After your tree reaches its 6-month establishment milestone, we provide precise GPS coordinates and can facilitate guided visits to our partner agriculture college sites.', 2),
('What species of trees are planted?', 'We prioritize native species such as Neem, Peepal, Banyan, and Gulmohar. These species are selected for their high survival rates, ecological compatibility, and cultural significance in the Indian landscape.', 3),
('How do I get my certificate?', 'Certificates are generated instantly once your steward identity is verified. You can find and download your high-resolution official PDF certificates directly from your Dashboard.', 4),
('What happens if a tree doesn''t survive?', 'We guarantee survival. If a sapling fails during the first 3 years of its growth, our field partners automatically replace it with a new healthy specimen at no extra cost to the steward.', 5)
ON CONFLICT DO NOTHING;

-- 6. Media Manager Table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type text NOT NULL CHECK (asset_type IN ('press_release', 'media_coverage', 'gallery_image', 'video')),
  title text NOT NULL,
  date_published text,
  excerpt_or_headline text,
  publisher_or_location text,
  media_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON media_assets USING (auth.role() = 'authenticated');


-- 7. Contact Messages (Inquiries) Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'Unread',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Important: Allow anyone to insert (so they can send queries from the contact page)
CREATE POLICY "Anyone can send inquiries" ON contact_messages FOR INSERT WITH CHECK (true);

-- Only authenticated admins can view and manage inquiries
CREATE POLICY "Admins can view inquiries" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage inquiries" ON contact_messages USING (auth.role() = 'authenticated');
