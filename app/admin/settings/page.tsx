'use client';
import React, { useState, useEffect } from 'react';
import { Save, Building, Mail, Phone, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { Input } from '@/app/src/components/ui/input';
import { Textarea } from '@/app/src/components/ui/textarea';
import { Button } from '@/app/src/components/ui/button';
import { useRouter } from 'next/navigation';


const AdminSettings: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    socialFacebook: '',
    socialInstagram: '',
    socialYoutube: '',
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/admin/setting');
      const data = await response.json();
      
      if (response.ok && data.settings) {
        // If settings exist, use the first one (assuming single settings record)
        if (Array.isArray(data.settings) && data.settings.length > 0) {
          const setting = data.settings[0];
          setSettingId(setting.id);
          setSettings({
            businessName: setting.businessName || '',
            email: setting.email || '',
            phone: setting.phone || '',
            address: setting.address || '',
            website: setting.website || '',
            description: setting.description || '',
            socialFacebook: setting.socialFacebook || '',
            socialInstagram: setting.socialInstagram || '',
            socialYoutube: setting.socialYoutube || '',
          });
        } else if (!Array.isArray(data.settings)) {
          // Single setting object
          const setting = data.settings;
          setSettingId(setting.id);
          setSettings({
            businessName: setting.businessName || '',
            email: setting.email || '',
            phone: setting.phone || '',
            address: setting.address || '',
            website: setting.website || '',
            description: setting.description || '',
            socialFacebook: setting.socialFacebook || '',
            socialInstagram: setting.socialInstagram || '',
            socialYoutube: setting.socialYoutube || '',
          });
        }
      } else if (response.status === 404 || (Array.isArray(data.settings) && data.settings.length === 0)) {
        // No settings found - this is okay, we'll create them on first save
        console.log('No settings found, will create on first save');
      } else {
        console.error('Failed to fetch settings:', data);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive'
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const settingData = {
      id: settingId,
      businessName: settings.businessName,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      website: settings.website,
      description: settings.description,
      socialFacebook: settings.socialFacebook,
      socialInstagram: settings.socialInstagram,
      socialYoutube: settings.socialYoutube,
    };

    try {
      let response;
      
      if (settingId) {
        // Update existing settings
        response = await fetch('/api/admin/setting', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingData),
        });
      } else {
        // Create new settings
        response = await fetch('/api/admin/setting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingData),
        });
      }

      const result = await response.json();

      if (response.ok) {
        if (!settingId && result.setting) {
          // Store the new setting ID
          setSettingId(result.setting.id);
        }
        
        toast({
          title: 'Settings Saved',
          description: 'Your changes have been saved successfully.',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save settings',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings.</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your business settings.</p>
      </div>

      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-gold" />
          Business Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
            <Input
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder="Royal Weddings Studio"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@royalweddings.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Business Address</label>
            <Input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="42, Royal Plaza, MG Road, New Delhi - 110001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </label>
            <Input
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              placeholder="www.royalweddings.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Business Description</label>
            <Textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              placeholder="India's premier wedding photography & cinematography studio..."
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Social Media Links</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Facebook</label>
            <Input
              value={settings.socialFacebook}
              onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Instagram</label>
            <Input
              value={settings.socialInstagram}
              onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">YouTube</label>
            <Input
              value={settings.socialYoutube}
              onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="royal" onClick={handleSave} disabled={loading}>
          {loading && (
            <span
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              aria-hidden
            />
          )}
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;