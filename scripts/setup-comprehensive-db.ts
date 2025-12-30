import { pool } from '@/lib/db';

async function setupComprehensiveDatabase() {
  try {
    console.log('Setting up comprehensive admin panel database...');

    // 1) Media table - tüm medya dosyaları için merkezi tablo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        url VARCHAR(1000) NOT NULL,
        filename VARCHAR(255),
        media_type VARCHAR(20) NOT NULL, -- 'image' | 'video' | 'other'
        mime_type VARCHAR(100),
        alt_text_tr VARCHAR(255),
        alt_text_en VARCHAR(255),
        uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2) Hero videolar (homepage - tıklanabilir video değişimi için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_videos (
        id SERIAL PRIMARY KEY,
        media_id INT REFERENCES media(id) ON DELETE SET NULL,
        title_tr VARCHAR(255),
        title_en VARCHAR(255),
        description_tr TEXT,
        description_en TEXT,
        is_active BOOLEAN DEFAULT true,
        order_no INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3) "Why we exist" bölümü - ana kayıt
    await pool.query(`
      CREATE TABLE IF NOT EXISTS why_sections (
        id SERIAL PRIMARY KEY,
        section_title_tr VARCHAR(255),
        section_title_en VARCHAR(255),
        paragraph1_tr TEXT,
        paragraph1_en TEXT,
        paragraph2_tr TEXT,
        paragraph2_en TEXT,
        paragraph3_tr TEXT,
        paragraph3_en TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3b) Why we exist için 3 image slot
    await pool.query(`
      CREATE TABLE IF NOT EXISTS why_images (
        id SERIAL PRIMARY KEY,
        why_section_id INT REFERENCES why_sections(id) ON DELETE CASCADE,
        media_id INT REFERENCES media(id) ON DELETE SET NULL,
        caption_tr VARCHAR(255),
        caption_en VARCHAR(255),
        order_no INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4) Services: collections (homepage'te görünen "services" kısmı)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_collections (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(150) UNIQUE NOT NULL,
        title_tr VARCHAR(255),
        title_en VARCHAR(255),
        hero_media_id INT REFERENCES media(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5) Services (her bir servisin meta bilgisi)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        collection_id INT REFERENCES service_collections(id) ON DELETE CASCADE,
        name_tr VARCHAR(255),
        name_en VARCHAR(255),
        media_id INT REFERENCES media(id) ON DELETE SET NULL,
        order_no INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6) Service içerikleri (detay paragrafları)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_contents (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES services(id) ON DELETE CASCADE,
        content_tr TEXT,
        content_en TEXT,
        extra_media_id INT REFERENCES media(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7) Contact info (sitenin iletişim bilgileri)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(100),
        address_tr TEXT,
        address_en TEXT,
        linkedin_url VARCHAR(1000),
        instagram_url VARCHAR(1000),
        updated_by INT REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8) Contact / İşbirliği mesajları
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        subject VARCHAR(255),
        message TEXT,
        source VARCHAR(100) DEFAULT 'contact_form',
        is_read BOOLEAN DEFAULT false,
        is_processed BOOLEAN DEFAULT false,
        resend_requested BOOLEAN DEFAULT false,
        resent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9) Admin activity log (admin işlemlerini takip için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id SERIAL PRIMARY KEY,
        admin_id INT REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id INT,
        description TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10) CTA Section (Call to Action - "Your Vision Deserves" bölümü + kayan text)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cta_section (
        id SERIAL PRIMARY KEY,
        main_title_en TEXT NOT NULL,
        main_title_tr TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_tr TEXT NOT NULL,
        button_text_en VARCHAR(100) NOT NULL,
        button_text_tr VARCHAR(100) NOT NULL,
        button_link VARCHAR(255) DEFAULT '#contact',
        background_image_media_id INT REFERENCES media(id) ON DELETE SET NULL,
        marquee_items JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully!');

    // Sample data ekleme
    await insertSampleData();

    console.log('Comprehensive database setup completed!');

  } catch (error) {
    console.error('Database setup error:', error);
  }
}

async function insertSampleData() {
  console.log('Inserting sample data...');

  // Default media files (existing ones)
  const mediaInserts = [
    { url: '/BackgroundVideo.mp4', filename: 'BackgroundVideo.mp4', type: 'video', mime: 'video/mp4', alt_tr: 'Arka plan videosu', alt_en: 'Background video' },
    { url: '/image1.png', filename: 'image1.png', type: 'image', mime: 'image/png', alt_tr: 'Birinci görsel', alt_en: 'First image' },
    { url: '/image2.png', filename: 'image2.png', type: 'image', mime: 'image/png', alt_tr: 'İkinci görsel', alt_en: 'Second image' },
    { url: '/image3.png', filename: 'image3.png', type: 'image', mime: 'image/png', alt_tr: 'Üçüncü görsel', alt_en: 'Third image' },
    { url: '/image4.png', filename: 'image4.png', type: 'image', mime: 'image/png', alt_tr: 'Hizmetler görseli', alt_en: 'Services image' }
  ];

  const mediaIds = [];
  for (const media of mediaInserts) {
    const result = await pool.query(`
      INSERT INTO media (url, filename, media_type, mime_type, alt_text_tr, alt_text_en)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [media.url, media.filename, media.type, media.mime, media.alt_tr, media.alt_en]);
    
    if (result.rows.length > 0) {
      mediaIds.push(result.rows[0].id);
    } else {
      // Get existing ID
      const existing = await pool.query('SELECT id FROM media WHERE url = $1', [media.url]);
      if (existing.rows.length > 0) {
        mediaIds.push(existing.rows[0].id);
      }
    }
  }

  // Hero video
  if (mediaIds.length > 0) {
    await pool.query(`
      INSERT INTO hero_videos (
        media_id, title_tr, title_en, description_tr, description_en
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [
      mediaIds[0], // BackgroundVideo.mp4
      'Markaları süslemek için burada değiliz.',
      'We are not here to decorate brands.',
      null, // Hero section'da açıklama yok şu anda
      null
    ]);
  }

  // Why we exist section
  const whySection = await pool.query(`
    INSERT INTO why_sections (
      section_title_tr, section_title_en,
      paragraph1_tr, paragraph1_en,
      paragraph2_tr, paragraph2_en,
      paragraph3_tr, paragraph3_en
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT DO NOTHING
    RETURNING id
  `, [
    'NEDEN VARIZ',
    'WHY WE EXIST',
    'Markalar başka bir kampanyaya ihtiyaç duymuyorlar. Niyetli fikirlere ihtiyaçları var — insanları harekete geçiren, algı oluşturan ve bir scroll\'un ötesinde yaşayan fikirler. Yaratıcılığın aşinalığın bittiği yerde başladığına inanıyoruz. Algıyı süslemek için burada değiliz; onu şekillendirmek için buradayız.',
    'Brands don\'t need another campaign. They need ideas with intention — ideas that move people, build perception, and last beyond a scroll. We believe creativity begins where familiarity ends. We\'re not here to decorate perception; we\'re here to shape it.',
    'Çalışmalarımız mantık ve duygu arasında, ticaret ve kültür arasında var oluyor. Her markanın bir varlığı vardır. Ama her varlık hissedilmez. Reklamcılığı hikaye anlatımı olarak değil, anlam yaratma olarak görüyoruz — yaratıcılığın markaların neyi temsil ettiğine şekil verdiği, stratejinin de ona yön verdiği yer.',
    'Our work exists between logic and emotion, between commerce and culture. Every brand has a presence. But not every presence is felt. We see advertising not as storytelling, but as sense-making — where creativity gives shape to what brands stand for, and strategy gives it direction.',
    'Fladvart, hissedilmek isteyen markalar için inşa edilmiş bir yaratıcı stüdyodur — sadece görülmek için değil.',
    'Fladvart is a creative studio built for brands that want to be felt — not just seen.'
  ]);

  // Why images
  if (whySection.rows.length > 0 && mediaIds.length >= 4) {
    const whySectionId = whySection.rows[0].id;
    const whyImageData = [
      { mediaId: mediaIds[1], order: 1, caption_tr: 'İlk görsel', caption_en: 'First image' },
      { mediaId: mediaIds[2], order: 2, caption_tr: 'İkinci görsel', caption_en: 'Second image' },
      { mediaId: mediaIds[3], order: 3, caption_tr: 'Üçüncü görsel', caption_en: 'Third image' }
    ];

    for (const img of whyImageData) {
      await pool.query(`
        INSERT INTO why_images (why_section_id, media_id, caption_tr, caption_en, order_no)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [whySectionId, img.mediaId, img.caption_tr, img.caption_en, img.order]);
    }
  }

  // Service collection
  const serviceCollection = await pool.query(`
    INSERT INTO service_collections (
      slug, title_tr, title_en, hero_media_id
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
  `, [
    'homepage_services',
    'HİZMETLER',
    'SERVICES',
    mediaIds[4] // image4.png
  ]);

  // Services
  if (serviceCollection.rows.length > 0) {
    const collectionId = serviceCollection.rows[0].id;
    const services = [
      { name_tr: 'MARKA MİMARİSİ', name_en: 'BRAND ARCHITECTURE', order: 1 },
      { name_tr: 'GÖRSEL YÖNETİM', name_en: 'VISUAL DIRECTION', order: 2 },
      { name_tr: 'KAMPANYA VE ANLATIM TASARIMI', name_en: 'CAMPAIGN & NARRATIVE DESIGN', order: 3 },
      { name_tr: 'DİJİTAL VE HAREKET DENEYİMLERİ', name_en: 'DIGITAL & MOTION EXPERIENCES', order: 4 },
      { name_tr: 'KREATİF DANIŞMANLIK', name_en: 'CREATIVE CONSULTANCY', order: 5 }
    ];

    // Detailed service content data
    const serviceContentData = {
      'BRAND ARCHITECTURE': {
        content_tr: 'İsimlendirme, konumlandırma ve fikirlere nabız vermeye yönelik tasarlanmış kimlik sistemleri. Stratejik çekirdeklerinde, insani ifadelerinde canlı hissettiren markalar inşa ediyoruz.',
        content_en: 'Naming, positioning, and identity systems designed to give ideas a pulse. We build brands that feel alive — strategic at their core, human in their expression.'
      },
      'VISUAL DIRECTION': {
        content_tr: 'Algıyı şekillendiren tasarım, hareket ve sanat yönetimi. Minimalist kompozisyonlardan hareketli görsellere — her kare niyet taşır.',
        content_en: 'Design, motion, and art direction that shape perception. From minimalist compositions to moving visuals — every frame carries intention.'
      },
      'CAMPAIGN & NARRATIVE DESIGN': {
        content_tr: 'Sloganların ötesinde konuşan kampanyalar hazırlıyoruz — iş hedeflerini insani duyguyla buluşturan hikayeler. Her kelime, her kare, her duraklama hikayenin parçası.',
        content_en: 'We craft campaigns that speak beyond slogans — stories that connect business goals with human emotion. Every word, every frame, every pause is part of the story.'
      },
      'DIGITAL & MOTION EXPERIENCES': {
        content_tr: 'Dijital deneyimler ve hareket tasarımı ile markaların dijital varlığını güçlendiriyoruz. Her etkileşim anlamlı, her hareket kasıtlı.',
        content_en: 'We strengthen brands\' digital presence with digital experiences and motion design. Every interaction is meaningful, every movement is intentional.'
      },
      'CREATIVE CONSULTANCY': {
        content_tr: 'Markaların özlerini yeniden keşfetmelerine yardımcı oluyoruz — ne söyledikleri, ne gösterdikleri ve neyi temsil ettiklerini uyumlaştırarak.',
        content_en: 'We help brands rediscover their essence — aligning what they say, what they show, and what they stand for.'
      }
    };

    for (const service of services) {
      const serviceResult = await pool.query(`
        INSERT INTO services (
          collection_id, name_tr, name_en, order_no
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [collectionId, service.name_tr, service.name_en, service.order]);

      // Add detailed content for each service
      if (serviceResult.rows.length > 0) {
        const contentData = serviceContentData[service.name_en as keyof typeof serviceContentData];
        await pool.query(`
          INSERT INTO service_contents (
            service_id, content_tr, content_en
          )
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [
          serviceResult.rows[0].id,
          contentData.content_tr,
          contentData.content_en
        ]);
      }
    }
  }

  // Contact info
  await pool.query(`
    INSERT INTO contact_info (
      email, phone, address_tr, address_en, 
      linkedin_url, instagram_url
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT DO NOTHING
  `, [
    'info@flad.art',
    '+90 538 9953',
    'NİŞBETİYE, NİŞBETİYE CD NO:24, 34340 BEŞİKTAŞ/İSTANBUL, TÜRKİYE',
    'NİŞBETİYE, NİŞBETİYE CD NO:24, 34340 BEŞİKTAŞ/İSTANBUL, TURKEY',
    'https://linkedin.com/company/fladvart',
    'https://instagram.com/fladvart'
  ]);

  // CTA Section
  await pool.query(`
    INSERT INTO cta_section (
      main_title_en, main_title_tr,
      description_en, description_tr,
      button_text_en, button_text_tr,
      button_link,
      marquee_items
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT DO NOTHING
  `, [
    'YOUR VISION DESERVES A TAILORED SOLUTION',
    'VİZYONUNUZ ÖZEL BİR ÇÖZÜM HAK EDİYOR',
    'SHARE YOUR GOALS AND WE\'LL CRAFT A CUSTOM OFFER FOR YOUR BRAND.',
    'HEDEFLERİNİZİ PAYLAŞIN, MARKANIZ İÇİN ÖZEL BİR TEKLİF HAZIRLAYALIM.',
    'LET\'S COLLABORATE',
    'İŞBİRLİĞİ YAPALIM',
    '#contact',
    '["CREATIVE CONSULTANCY", "DIGITAL & MOTION EXPERIENCES", "CAMPAIGN & BRAND DESIGN", "CREATIVE CONSULTANCY", "DIGITAL & MOTION EXPERIENCES"]'
  ]);

  console.log('Sample data inserted successfully!');
}

// Run if called directly
if (require.main === module) {
  setupComprehensiveDatabase().finally(() => pool.end());
}

export { setupComprehensiveDatabase };
