import { getServerSession } from '@/app/lib/firebase/server-auth';
import { settingService } from '@/app/lib/services/setting-service';
import { NextResponse } from 'next/server';

// GET all settings
export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const settings = await settingService.getAllSettings();
    console.log('Fetched settings:', settings);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// POST create settings
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    // Create new setting
    const newSetting = await settingService.createSetting({
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      socialFacebook: data.socialFacebook,
      socialInstagram: data.socialInstagram,
      socialYoutube: data.socialYoutube,
    });
    return NextResponse.json({ setting: newSetting }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update settings
export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const updatedSetting = await settingService.updateSetting(data.id, {
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      socialFacebook: data.socialFacebook,
      socialInstagram: data.socialInstagram,
      socialYoutube: data.socialYoutube,
    });
    if (!updatedSetting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }
    return NextResponse.json({ setting: updatedSetting });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE all settings
export async function DELETE() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const success = await settingService.deleteAllSettings();
    if (!success) {
      return NextResponse.json({ error: 'No settings to delete' }, { status: 404 });
    }
    return NextResponse.json({ message: 'All settings deleted successfully' });
  } catch (error) {
    console.error('Error deleting settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
