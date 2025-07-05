const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@florka.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the admin password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      saltRounds
    );

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@florka.com',
        password: hashedPassword,
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'User',
        role: 'admin',
        status: 'active'
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;