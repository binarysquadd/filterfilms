import { userService } from '@/app/lib/services/user-service.server';

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'subhamabo@gmail.com';
  
  const existingUser = await userService.getUserByEmail(adminEmail);
  
  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  await userService.createUser({
    email: adminEmail,
    name: 'Admin User',
    role: 'admin',
  });

  console.log(`✅ Admin user created: ${adminEmail}`);
}

createAdmin();
