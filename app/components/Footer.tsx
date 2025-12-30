"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t, locale } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    phone: "",
    serviceInterest: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [linkedinUrl, setLinkedinUrl] = useState<string>("");
  const [instagramUrl, setInstagramUrl] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [addressTr, setAddressTr] = useState<string>("");
  const [addressEn, setAddressEn] = useState<string>("");

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/admin/contact-info");
        if (response.ok) {
          const data = await response.json();
          if (data) {
            if (data.linkedin_url) setLinkedinUrl(data.linkedin_url);
            if (data.instagram_url) setInstagramUrl(data.instagram_url);
            if (data.email) setContactEmail(data.email);
            if (data.phone) setContactPhone(data.phone);
            if (data.address_tr) setAddressTr(data.address_tr);
            if (data.address_en) setAddressEn(data.address_en);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-locale": locale
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: "success",
          message: data.message,
        });

        setFormData({
          name: "",
          email: "",
          company: "",
          message: "",
          phone: "",
          serviceInterest: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || t('api.contact.error'),
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: t('api.contact.error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="relative text-white overflow-hidden">
      {/* 50/50 background */}
      <div className="absolute inset-0 bg-[#070c18]" aria-hidden="true" />
      <div
        className="hidden md:block absolute inset-y-0 left-0 w-1/2 bg-[#121727]"
        aria-hidden="true"
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Make the reference “one screen panel” on desktop */}
        <div className="pt-2 md:pt-10 pb-6 md:pb-8 flex flex-col">
          {/* MAIN 2-COL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 flex-1">
            {/* LEFT */}
            <div className="pr-0 md:pr-8">
              {/* LOGO BLOCK - Reduced height */}
              <div className="hidden md:flex h-[10vh] items-center mb-2">
                <img
                  src="/logofladvart.png"
                  alt="logo"
                  className="w-[28rem] h-auto -ml-18"
                />
              </div>

              {/* Mobile logo */}
              <div className="md:hidden -mt-4 -mb-36">
                <img
                  src="/logofladvart.png"
                  alt="logo"
                  className="h-96 w-auto -ml-10 -mt-30"
                />
              </div>

              {/* FORM TITLE */}
              <h3 className="text-base md:text-lg font-bold mb-4 md:mb-5">
                {t("footer.lets")}
              </h3>

              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg mb-8 ${submitStatus.type === "success"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                    }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {/* FORM */}
              <form className="space-y-5 md:space-y-7 mb-2" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition text-white text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition text-white text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.company")}</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    autoComplete="organization"
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition text-white placeholder:text-white/40 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.message")}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("footer.message_placeholder")}

                    required
                    rows={1}
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition resize-none text-white placeholder:text-white/40 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("footer.phone_placeholder")}
                    autoComplete="tel"
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition text-white placeholder:text-white/40 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm mb-1">{t("footer.service")}</label>
                  <input
                    type="text"
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    placeholder={t("footer.service_placeholder")}
                    className="w-full bg-transparent border-b border-white/30 py-2 md:py-3 focus:outline-none focus:border-white transition text-white placeholder:text-white/40 text-sm md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-white text-gray-900 px-8 md:px-10 py-2.5 md:py-3 rounded-sm font-semibold transition text-sm md:text-base ${isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                    }`}
                >
                  {isSubmitting
                    ? t("footer.submitting") || "Sending..."
                    : t("footer.submit")}
                </button>
              </form>
            </div>

            {/* RIGHT (reference-like block placement) */}
            <div className="pl-0 md:pl-8">
              {/* Optimized spacing */}
              <div className="mt-8 md:mt-56">
                {/* HQ + CONTACT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-10 md:mb-12">
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">
                      FLADVART CREATIVE HQ
                    </h4>
                    <p className="text-white/55 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {locale === "tr" 
                        ? (addressTr || "NİŞBETİYE, NİŞBETİYE CD NO:24,\n34340 BEŞİKTAŞ/İSTANBUL,\nTÜRKİYE")
                        : (addressEn || "NİŞBETİYE, NİŞBETİYE CD NO:24,\n34340 BEŞİKTAŞ/İSTANBUL,\nTÜRKİYE")
                      }
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">
                      {t("footer.contact")}
                    </h4>
                    <div className="grid grid-cols-[40px_1fr] md:grid-cols-[44px_1fr] gap-x-3 md:gap-x-5 gap-y-2 text-xs md:text-sm">
                      <span className="text-white/70">{t("footer.phone_label")}</span>
                      <span className="text-white font-semibold">{contactPhone || "+90 538 9953"}</span>

                      <span className="text-white/70">{t("footer.email_label")}</span>
                      <span className="text-white font-semibold">{contactEmail || "info@flad.art"}</span>
                    </div>
                  </div>
                </div>

                {/* LINKS */}
                <div className="grid grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-10">
                  <a 
                    href="#contact" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs md:text-sm hover:text-white/70 transition cursor-pointer"
                  >
                    {t("footer.contact_us")}
                  </a>
                  <a 
                    href="#why" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs md:text-sm hover:text-white/70 transition cursor-pointer"
                  >
                    {t("footer.why_we_exist")}
                  </a>
                  <a 
                    href="#services" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs md:text-sm hover:text-white/70 transition cursor-pointer"
                  >
                    {t("footer.services")}
                  </a>
                </div>

                {/* SOCIAL */}
                <div className="flex gap-3 md:gap-4 mb-8 md:mb-72">
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                    >
                      <span className="text-gray-900 text-lg md:text-xl font-semibold">in</span>
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                    >
                      <svg 
                        className="w-5 h-5 md:w-5 md:h-5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" 
                          fill="#1a1a1a"
                        />
                      </svg>
                    </a>
                  )}
                  <a
                    href="https://wa.me/905334465350"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                    aria-label="WhatsApp"
                  >
                    <svg 
                      className="w-5 h-5 md:w-5 md:h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
                        fill="#1a1a1a"
                      />
                    </svg>
                  </a>
                </div>

                {/* COPYRIGHT */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white/55 text-xs md:text-sm gap-2 md:gap-0">
                  <p>{t('footer.copyright')}</p>
                  <p>© 2026</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
