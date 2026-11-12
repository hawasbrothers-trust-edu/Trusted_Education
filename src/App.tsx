import React, { useState } from 'react';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext.tsx';
import { isAdminRoutePath } from './utils/cmsHelpers.ts';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { StatsBar } from './components/StatsBar.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { ServiceDetailModal } from './components/ServiceDetailModal.tsx';
import { WorkflowSection } from './components/WorkflowSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { OrderFormSection } from './components/OrderFormSection.tsx';
import { BlogSection } from './components/BlogSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal.tsx';
import type { AcademicServiceItem } from './utils/academicCalculations.ts';

const PublicWebsite: React.FC = () => {
  const { content } = useSiteContent();
  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<AcademicServiceItem | null>(null);
  const [preselectedServiceForOrder, setPreselectedServiceForOrder] = useState<string>(
    content.services[0]?.title || 'إعداد رسائل الماجستير والدكتوراه'
  );
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleOpenOrderForm = (serviceTitle?: string) => {
    if (serviceTitle) {
      setPreselectedServiceForOrder(serviceTitle);
    }
    const orderSection = document.getElementById('order-form');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderFromDetailModal = (service: AcademicServiceItem) => {
    setSelectedServiceForModal(null);
    handleOpenOrderForm(service.title);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#2D3748] font-sans">
      <Header onOpenOrderModal={() => handleOpenOrderForm()} />

      <main className="flex-1">
        <Hero
          onOpenOrderModal={() => handleOpenOrderForm()}
          onExploreServices={handleExploreServices}
        />

        <StatsBar />

        <ServicesSection
          onSelectService={(service) => setSelectedServiceForModal(service)}
          onRequestService={(serviceTitle) => handleOpenOrderForm(serviceTitle)}
        />

        <WorkflowSection onStartOrder={() => handleOpenOrderForm()} />

        <AboutSection onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />

        <TestimonialsSection />

        <OrderFormSection preselectedService={preselectedServiceForOrder} />

        <BlogSection />

        <FaqSection />

        <ContactSection />
      </main>

      <Footer onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)} />

      <FloatingWhatsApp />

      <ServiceDetailModal
        service={selectedServiceForModal}
        onClose={() => setSelectedServiceForModal(null)}
        onOrderNow={handleOrderFromDetailModal}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};

const AppShell: React.FC = () => {
  const { currentPath } = useSiteContent();

  if (isAdminRoutePath(currentPath)) {
    return <AdminPortal />;
  }

  return <PublicWebsite />;
};

export default function App() {
  return (
    <SiteContentProvider>
      <AppShell />
    </SiteContentProvider>
  );
}
