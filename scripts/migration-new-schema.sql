-- =====================================================
-- FLADVart Database Migration Script
-- =====================================================
-- USERS TABLOSU KORUNACAK - DİĞER HER ŞEY SİLİNİP YENİDEN OLUŞTURULACAK
-- =====================================================
-- 
-- Kullanım:
-- 1. pgAdmin'i açın
-- 2. FLADVart database'ine bağlanın
-- 3. Query Tool'u açın (Tools > Query Tool veya Alt+Shift+Q)
-- 4. Bu script'in tamamını yapıştırın
-- 5. Execute (F5) tuşuna basın
-- 
-- =====================================================

-- Drop existing tables (except users)
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS service_tags CASCADE;
DROP TABLE IF EXISTS service_contents CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_collections CASCADE;
DROP TABLE IF EXISTS why_images CASCADE;
DROP TABLE IF EXISTS why_sections CASCADE;
DROP TABLE IF EXISTS hero_videos CASCADE;
DROP TABLE IF EXISTS contact_info CASCADE;
DROP TABLE IF EXISTS media CASCADE;

-- =====================================================
-- 1. MEDIA TABLE
-- Stores all uploaded files (images, videos) from Firebase
-- =====================================================
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    firebase_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image' or 'video'
    file_size BIGINT, -- in bytes
    upload_context VARCHAR(100), -- e.g., 'hero_video', 'service_image_1'
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_media_type ON media(file_type);
CREATE INDEX idx_media_context ON media(upload_context);

-- =====================================================
-- 2. HERO VIDEOS TABLE
-- Stores hero section video and text content
-- =====================================================
CREATE TABLE hero_videos (
    id SERIAL PRIMARY KEY,
    media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    title_en TEXT,
    title_tr TEXT,
    description_en TEXT,
    description_tr TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. WHY WE EXIST SECTION
-- Stores main content for "Why We Exist" section
-- =====================================================
CREATE TABLE why_sections (
    id SERIAL PRIMARY KEY,
    main_title_en VARCHAR(255),
    main_title_tr VARCHAR(255),
    left_title_en TEXT,
    left_title_tr TEXT,
    right_paragraph_1_en TEXT,
    right_paragraph_1_tr TEXT,
    right_paragraph_2_en TEXT,
    right_paragraph_2_tr TEXT,
    bottom_text_en TEXT,
    bottom_text_tr TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. WHY WE EXIST IMAGES
-- Stores the 3 images for "Why We Exist" section
-- =====================================================
CREATE TABLE why_images (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES why_sections(id) ON DELETE CASCADE,
    image_position INTEGER NOT NULL, -- 1, 2, or 3 (left, middle, right)
    media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_why_images_section ON why_images(section_id);

-- =====================================================
-- 5. SERVICE COLLECTIONS
-- Stores main settings for services section
-- =====================================================
CREATE TABLE service_collections (
    id SERIAL PRIMARY KEY,
    main_title_en VARCHAR(255),
    main_title_tr VARCHAR(255),
    main_image_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. SERVICES
-- Stores individual service items
-- =====================================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES service_collections(id) ON DELETE CASCADE,
    order_number INTEGER NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_order ON services(order_number);

-- =====================================================
-- 7. SERVICE CONTENTS
-- Stores detailed content for each service
-- =====================================================
CREATE TABLE service_contents (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    image_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
    middle_title_en TEXT,
    middle_title_tr TEXT,
    paragraph_1_en TEXT,
    paragraph_1_tr TEXT,
    paragraph_2_en TEXT,
    paragraph_2_tr TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_contents_service ON service_contents(service_id);

-- =====================================================
-- 8. SERVICE TAGS
-- Stores tags/keywords for each service
-- =====================================================
CREATE TABLE service_tags (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    tag_en VARCHAR(255),
    tag_tr VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_tags_service ON service_tags(service_id);

-- =====================================================
-- 9. CONTACT INFO
-- Stores contact information
-- =====================================================
CREATE TABLE contact_info (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(50),
    address_en TEXT,
    address_tr TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. CONTACT MESSAGES (Optional - for contact form)
-- =====================================================
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    message TEXT NOT NULL,
    service_interest VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_read ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_processed ON contact_messages(is_processed);
CREATE INDEX idx_contact_messages_date ON contact_messages(created_at);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert default service collection
INSERT INTO service_collections (main_title_en, main_title_tr) 
VALUES ('SERVICES', 'HİZMETLER');

-- Insert default contact info
INSERT INTO contact_info (email, phone, address_en, address_tr, linkedin_url, instagram_url) 
VALUES (
    'info@flad.art',
    '+90 538 9953',
    E'NİŞBETİYE, NİŞBETİYE CD NO:24,\n34340 BEŞİKTAŞ/İSTANBUL,\nTURKEY',
    E'NİŞBETİYE, NİŞBETİYE CD NO:24,\n34340 BEŞİKTAŞ/İSTANBUL,\nTÜRKİYE',
    'https://www.linkedin.com/company/fladvart',
    'https://www.instagram.com/fladvart'
);

-- Insert Why We Exist section
INSERT INTO why_sections (
    main_title_en, main_title_tr,
    left_title_en, left_title_tr,
    right_paragraph_1_en, right_paragraph_1_tr,
    right_paragraph_2_en, right_paragraph_2_tr,
    bottom_text_en, bottom_text_tr
) VALUES (
    'WHY WE EXIST', 'NEDEN VARIZ',
    E'WE''RE NOT HERE\nTO DECORATE PERCEPTION;\nWE''RE HERE TO SHAPE IT.',
    E'ALGILARI SÜSLEMEYİZ;\nONLARI ŞEKİLLENDİRİRİZ.',
    E'Brands don''t need another campaign. They need ideas with intention — ideas that move people, build perception, and last beyond a scroll. We believe creativity begins where familiarity ends. We''re not here to decorate perception; we''re here to shape it.',
    E'Markalar başka bir kampanyaya ihtiyaç duymuyor. Amacı olan fikirlere ihtiyaçları var — insanları harekete geçiren, algı oluşturan ve bir kaydırmanın ötesinde kalıcı olan fikirler. Yaratıcılığın, aşinalığın bittiği yerde başladığına inanıyoruz. Algıları süslemek için değil, şekillendirmek için buradayız.',
    E'Our work exists between logic and emotion, between commerce and culture. Every brand has a presence. But not every presence is felt. We see advertising not as storytelling, but as sense-making — where creativity gives shape to what brands stand for, and strategy gives it direction.',
    E'İşimiz mantık ve duygu arasında, ticaret ve kültür arasında var olur. Her markanın bir varlığı vardır. Ancak her varlık hissedilmez. Reklamcılığı hikaye anlatımı olarak değil, anlam yaratma olarak görüyoruz — yaratıcılığın markaların neyi temsil ettiğine şekil verdiği, stratejinin ise ona yön verdiği bir alan.',
    'Fladvart is a creative studio built for brands that want to be felt — not just seen.',
    'Fladvart, sadece görülmek değil, hissedilmek isteyen markalar için inşa edilmiş bir yaratıcı stüdyodur.'
);

-- =====================================================
-- GRANT PERMISSIONS (if needed)
-- =====================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
