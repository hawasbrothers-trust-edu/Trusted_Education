import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../context/SiteContentContext.tsx';
import { formatWhatsAppUrl } from '../utils/academicCalculations.ts';
import { MessageCircle, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenOrderModal: (serviceId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOrderModal }) => {
  const { content } = useSiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'من نحن', href: '#about' },
    { label: 'كيف نعمل', href: '#workflow' },
    { label: 'آراء الباحثين', href: '#testimonials' },
    { label: 'المقالات العلمية', href: '#blog' },
    { label: 'اتصل بنا', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickWhatsAppUrl = formatWhatsAppUrl(
    content.contact.whatsappNumber,
    `السلام عليكم، أرغب في الاستفسار عن الخدمات الأكاديمية والطلابية المتاحة لدى شركة ${content.brand.shortName}.`
  );

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark & Official Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-3 shrink-0 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2C5F8A]"
            aria-label={`الصفحة الرئيسية لشركة ${content.brand.shortName}`}
          >
            <img
              src={content.brand.logoUrl}
              alt={`شعار شركة ${content.brand.shortName}`}
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-base sm:text-lg text-[#1A3A5C] leading-tight tracking-tight whitespace-nowrap">
                {content.brand.shortName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                {content.brand.subtitle}
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
            aria-label="القائمة الرئيسية"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="whitespace-nowrap shrink-0 hover:text-[#2C5F8A] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#2C5F8A] after:absolute after:bottom-0 after:right-0 after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Direct Actions & Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={quickWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="مراسلة سريعة عبر واتساب"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2C5F8A] bg-[#F0F5FA] hover:bg-[#E2ECF6] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{content.brand.headerWhatsappText}</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenOrderModal()}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2C5F8A] hover:bg-[#1A3A5C] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2C5F8A]"
            >
              {content.brand.headerCtaText}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-[#1A3A5C] hover:bg-slate-100 rounded-lg focus:outline-hidden"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 mt-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-lg hover:bg-[#F0F5FA] hover:text-[#2C5F8A] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={quickWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>محادثة واتساب: {content.contact.whatsappNumber}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderModal();
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#2C5F8A] rounded-lg hover:bg-[#1A3A5C] transition-colors"
            >
              {content.brand.headerCtaText}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
