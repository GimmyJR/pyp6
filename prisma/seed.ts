// prisma/seed.ts (CommonJS)
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Hash the password properly
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  // Delete existing admin user if it exists
  await prisma.user.deleteMany({
    where: { email: 'admin@example.com' }
  })
  
  // Create new admin user with proper hashed password
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      username: "admin"
    }
  })
  
  console.log('✅ Admin user created successfully!')
  console.log('📧 Email: admin@example.com')
  console.log('🔑 Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
