'use client'

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send');

      toast({
        title: 'Message Sent',
        description: 'We’ll get back to you shortly.',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        message: '',
      });
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact">
      {/* Header */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Get In Touch"
            subtitle="Let’s discuss how we can capture your story with elegance and emotion."
            centered
          />
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-start">

          {/* Contact Info */}
          <div className="space-y-10 text-muted-foreground">
            <InfoItem
              icon={<MapPin />}
              title="Studio Address"
              content={
                <>
                  Gandhinagar 2nd Lane Extension <br />
                  Near Mahamayee College <br />
                  Berhampur, Odisha – 760001
                </>
              }
            />

            <InfoItem
              icon={<Phone />}
              title="Phone"
              content={<>+91 9XXXXXXXXX<br />(Call / WhatsApp)</>}
            />

            <InfoItem
              icon={<Mail />}
              title="Email"
              content={<>info@filterfilm.in<br />bookings@filterfilm.in</>}
            />

            <InfoItem
              icon={<Clock />}
              title="Working Hours"
              content={
                <>
                  Mon – Sat: 10:00 AM – 7:00 PM <br />
                  Sunday: Appointment Only
                </>
              }
            />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-10 bg-primary/5 p-10"
          >
            <InputField
              label="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <InputField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <InputField
              label="Event Date"
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Your Message
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your event..."
                className="w-full bg-primary/10 px-1 border-b border-border py-3 focus:outline-none focus:border-gold transition-colors resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="royal"
              size="lg"
              className="rounded-full px-10 tracking-wider"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px]">
        <iframe
          title="Filter Film Studio Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000.532244267929!2d84.78148337281011!3d19.309579535386483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3d5170e456fcfd%3A0x8c02bc510a43c3f4!2sFilter%20Films!5e1!3m2!1sen!2sin!4v1766562605939!5m2!1sen!2sin"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </section>
    </div>
  );
}

/* ---------- Components ---------- */

function InfoItem({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-gold">{icon}</div>
      <div>
        <h4 className="text-sm uppercase tracking-wider text-foreground mb-1">
          {title}
        </h4>
        <p className="leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = 'text',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        {...props}
        className="w-full bg-primary/10 px-2 border-b border-border py-3 focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}
