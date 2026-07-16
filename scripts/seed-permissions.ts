const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const permissionsToSeed = [
  // User (Tenant) Permissions
  { name: 'FAVORITE_LISTING', description: 'Can add listings to their favorites.', module: 'USER', action: 'create' },
  { name: 'CREATE_INQUIRY', description: 'Can create property inquiries.', module: 'USER', action: 'create' },
  { name: 'VIEW_INQUIRIES', description: 'Can view their own property inquiries.', module: 'USER', action: 'read' },
  { name: 'VIEW_RESERVATIONS', description: 'Can view their own reservations.', module: 'USER', action: 'read' },
  { name: 'PAY_RESERVATION', description: 'Can pay for a reservation.', module: 'USER', action: 'update' },
  { name: 'CREATE_REVIEW', description: 'Can submit a property review.', module: 'USER', action: 'create' },
  { name: 'VIEW_REVIEWS', description: 'Can view their submitted reviews.', module: 'USER', action: 'read' },
  { name: 'UPDATE_PROFILE', description: 'Can update their profile information.', module: 'USER', action: 'update' },
  { name: 'UPLOAD_AVATAR', description: 'Can upload a profile avatar picture.', module: 'USER', action: 'create' },
  { name: 'UPDATE_PASSWORD', description: 'Can change their account password.', module: 'USER', action: 'update' },
  { name: 'SEND_MESSAGES', description: 'Can send chat messages.', module: 'USER', action: 'create' },
  { name: 'CREATE_HOST_APPLICATION', description: 'Can submit a host application.', module: 'USER', action: 'create' },

  // Landlord Permissions
  { name: 'VIEW_DASHBOARD', description: 'Can view the landlord dashboard.', module: 'LANDLORD', action: 'read' },
  { name: 'VIEW_PROPERTIES', description: 'Can view their own properties.', module: 'LANDLORD', action: 'read' },
  { name: 'CREATE_PROPERTY', description: 'Can create a new property listing.', module: 'LANDLORD', action: 'create' },
  { name: 'UPDATE_PROPERTY', description: 'Can update or delete their property.', module: 'LANDLORD', action: 'update' },
  { name: 'VIEW_ROOMS', description: 'Can view rooms for their properties.', module: 'LANDLORD', action: 'read' },
  { name: 'CREATE_ROOM', description: 'Can add a room to a property.', module: 'LANDLORD', action: 'create' },
  { name: 'UPDATE_ROOM', description: 'Can edit or delete a room.', module: 'LANDLORD', action: 'update' },
  { name: 'MANAGE_INQUIRIES', description: 'Can approve or reject inquiries.', module: 'LANDLORD', action: 'update' },
  { name: 'MANAGE_RESERVATIONS', description: 'Can manage reservations (check-in, complete, reject).', module: 'LANDLORD', action: 'update' },
  { name: 'RESPOND_REVIEW', description: 'Can respond to tenant reviews.', module: 'LANDLORD', action: 'create' },
  { name: 'VIEW_TENANT_PROFILE', description: 'Can view a tenants profile.', module: 'LANDLORD', action: 'read' },

  // System Admin (Moderator) Permissions
  { name: 'VIEW_MODERATION_QUEUE', description: 'Can view the moderation dashboard.', module: 'ADMIN', action: 'read' },
  { name: 'MODERATE_HOSTS', description: 'Can approve or reject host applications.', module: 'ADMIN', action: 'update' },
  { name: 'MODERATE_LISTINGS', description: 'Can approve or reject property listings.', module: 'ADMIN', action: 'update' },
  { name: 'MODERATE_REVIEWS', description: 'Can flag or delete inappropriate reviews.', module: 'ADMIN', action: 'update' },
  { name: 'MANAGE_USERS', description: 'Can suspend or manage malicious users.', module: 'ADMIN', action: 'update' },
];

async function main() {
  console.log('🌱 Starting permission seed...');

  for (const permission of permissionsToSeed) {
    const exists = await prisma.permission.findFirst({
      where: { name: permission.name },
    });

    if (!exists) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Created permission: ${permission.name}`);
    } else {
      console.log(`ℹ️ Permission already exists: ${permission.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
