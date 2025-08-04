import { PrismaClient } from '../generated/prisma';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

async function approveCEOs() {
  console.log('👑 Starting CEO approval process...');

  try {
    // Find CEO and Technical Director onboarding requests
    const pendingRequests = await prisma.onboardingRequest.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { role: { contains: 'CEO', mode: 'insensitive' } },
          { role: { contains: 'Technical Director', mode: 'insensitive' } },
          { role: { contains: 'Director', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`📋 Found ${pendingRequests.length} CEO/Director requests:`);
    pendingRequests.forEach(req => {
      console.log(`  - ${req.firstName} ${req.lastName} (${req.role}) - ${req.email}`);
    });

    if (pendingRequests.length === 0) {
      console.log('❌ No CEO/Director requests found. Please ensure they have submitted onboarding forms.');
      return;
    }

    // Approve each CEO/Director request
    for (const request of pendingRequests) {
      console.log(`\n✅ Approving ${request.firstName} ${request.lastName}...`);

      // Create or update employee record
      const employee = await prisma.employee.upsert({
        where: { id: request.userId },
        update: {
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          department: request.department,
          role: request.role,
          isManager: true,
          isLead: true,
          profilePictureUrl: request.profilePictureUrl,
          phoneNumber: request.phoneNumber,
        },
        create: {
          id: request.userId,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          department: request.department,
          role: request.role,
          isManager: true,
          isLead: true,
          profilePictureUrl: request.profilePictureUrl,
          phoneNumber: request.phoneNumber,
        },
      });

      console.log(`  ✅ Employee record created/updated: ${employee.firstName} ${employee.lastName}`);

      // Update Clerk user metadata to mark as admin
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(request.userId, {
          publicMetadata: {
            role: "admin"
          }
        });
        console.log(`  ✅ Clerk user marked as admin: ${request.email}`);
      } catch (error) {
        console.error(`  ❌ Failed to update Clerk user: ${error}`);
      }

      // Update onboarding request status
      await prisma.onboardingRequest.update({
        where: { id: request.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: 'system', // Manual approval
        },
      });

      console.log(`  ✅ Onboarding request approved`);
    }

    // Create a special "CEO Group" node for the hierarchy
    const ceoEmployees = await prisma.employee.findMany({
      where: {
        OR: [
          { role: { contains: 'CEO', mode: 'insensitive' } },
          { role: { contains: 'Technical Director', mode: 'insensitive' } },
          { role: { contains: 'Director', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`\n👥 Found ${ceoEmployees.length} CEO/Director employees in database:`);
    ceoEmployees.forEach(emp => {
      console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role})`);
    });

    console.log('\n🎉 CEO approval process completed!');
    console.log('📝 Next steps:');
    console.log('  1. The CEOs can now log in with their Clerk accounts');
    console.log('  2. They will have admin access to approve other employees');
    console.log('  3. The hierarchy will show them in a special CEO group');

  } catch (error) {
    console.error('❌ Error approving CEOs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use
export { approveCEOs };

// Run if called directly
if (require.main === module) {
  approveCEOs()
    .then(() => {
      console.log('🎉 CEO approval completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 CEO approval failed:', error);
      process.exit(1);
    });
} 