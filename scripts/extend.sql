-----24.11.2025
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false;

-- Add updated_at column if it doesn't exist
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on is_processed
CREATE INDEX IF NOT EXISTS idx_contact_messages_processed ON contact_messages(is_processed);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;

-----01.12.2025
-- CTA Section (Call to Action) tablosu oluştur
CREATE TABLE IF NOT EXISTS cta_section (
  id SERIAL PRIMARY KEY,
  
  -- Ana başlık
  main_title_en TEXT NOT NULL,
  main_title_tr TEXT NOT NULL,
  
  -- Açıklama
  description_en TEXT NOT NULL,
  description_tr TEXT NOT NULL,
  
  -- Buton
  button_text_en VARCHAR(100) NOT NULL,
  button_text_tr VARCHAR(100) NOT NULL,
  button_link VARCHAR(255) DEFAULT '#contact',
  
  -- Arka plan görseli
  background_image_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
  
  -- Kayan marquee text (JSONB array olarak)
  marquee_items JSONB NOT NULL DEFAULT '[]',
  -- Örnek: ["CREATIVE CONSULTANCY", "DIGITAL & MOTION EXPERIENCES", "CAMPAIGN & BRAND DESIGN"]
  
  -- Durumlar
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan veri ekle
INSERT INTO cta_section (
  main_title_en,
  main_title_tr,
  description_en,
  description_tr,
  button_text_en,
  button_text_tr,
  button_link,
  marquee_items
) VALUES (
  'YOUR VISION DESERVES A TAILORED SOLUTION',
  'VİZYONUNUZ ÖZEL BİR ÇÖZÜM HAK EDİYOR',
  'SHARE YOUR GOALS AND WE''LL CRAFT A CUSTOM OFFER FOR YOUR BRAND.',
  'HEDEFLERİNİZİ PAYLAŞIN, MARKANIZ İÇİN ÖZEL BİR TEKLİF HAZIRLAYALIM.',
  'LET''S COLLABORATE',
  'İŞBİRLİĞİ YAPALIM',
  '#contact',
  '["CREATIVE CONSULTANCY", "DIGITAL & MOTION EXPERIENCES", "CAMPAIGN & BRAND DESIGN", "CREATIVE CONSULTANCY", "DIGITAL & MOTION EXPERIENCES"]'::jsonb
);


-- CTA Section marquee_items yapısını güncelle (string[] -> object[])
-- Mevcut veriyi koruyarak yeni yapıya dönüştür

UPDATE cta_section
SET marquee_items = '[
  {
    "text_en": "CREATIVE CONSULTANCY",
    "text_tr": "KREATİF DANIŞMANLIK"
  },
  {
    "text_en": "DIGITAL & MOTION EXPERIENCES",
    "text_tr": "DİJİTAL & HAREKET DENEYİMLERİ"
  },
  {
    "text_en": "CAMPAIGN & BRAND DESIGN",
    "text_tr": "KAMPANYA & MARKA TASARIMI"
  },
  {
    "text_en": "CREATIVE CONSULTANCY",
    "text_tr": "KREATİF DANIŞMANLIK"
  },
  {
    "text_en": "DIGITAL & MOTION EXPERIENCES",
    "text_tr": "DİJİTAL & HAREKET DENEYİMLERİ"
  }
]'::jsonb
WHERE id = (SELECT id FROM cta_section ORDER BY id DESC LIMIT 1);


----- 15.12.2025

CREATE TABLE public.why_videos (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES public.why_sections(id) ON DELETE CASCADE,
  video_position INTEGER NOT NULL CHECK (video_position IN (1, 2)),
  media_id INTEGER REFERENCES public.media(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- aynı section içinde aynı pozisyona 2 video yazılmasın
CREATE UNIQUE INDEX uq_why_videos_section_position
  ON public.why_videos(section_id, video_position);

-- sorgu performansı
CREATE INDEX idx_why_videos_section
  ON public.why_videos(section_id);


INSERT INTO public.why_videos (section_id, video_position, media_id)
VALUES
  (1, 1, NULL),
  (1, 2, NULL)
ON CONFLICT (section_id, video_position)
DO NOTHING;

