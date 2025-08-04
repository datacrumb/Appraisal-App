import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function fixUnconnectedUsers() {
  console.log('🔧 Starting to fix unconnected users...');

  try {
    // Get all users and their relations
    const allUsers = await prisma.employee.findMany();
    const allRelations = await prisma.employeeRelation.findMany();
    
    console.log(`📊 Found ${allUsers.length} total users`);
    console.log(`🔗 Found ${allRelations.length} existing relations`);

    // Find users who have incoming relations (are supervised by someone)
    const usersWithIncomingRelations = new Set();
    allRelations.forEach(rel => usersWithIncomingRelations.add(rel.toId));

    // Find unconnected users (no incoming relations)
    const unconnectedUsers = allUsers.filter(user => !usersWithIncomingRelations.has(user.id));
    
    console.log(`❌ Found ${unconnectedUsers.length} unconnected users:`);
    unconnectedUsers.forEach(user => {
      const role = user.isManager ? 'Manager' : user.isLead ? 'Lead' : 'Employee';
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${role}`);
    });

    if (unconnectedUsers.length === 0) {
      console.log('✅ All users are already connected!');
      return;
    }

    // Find potential supervisors (managers, leads, or CEO)
    const potentialSupervisors = allUsers.filter(user => 
      user.isManager || user.isLead || user.role?.toLowerCase().includes('ceo')
    );

    console.log(`👨‍💼 Found ${potentialSupervisors.length} potential supervisors:`);
    potentialSupervisors.forEach(supervisor => {
      const role = supervisor.isManager ? 'Manager' : supervisor.isLead ? 'Lead' : 'CEO';
      console.log(`  - ${supervisor.firstName} ${supervisor.lastName} (${supervisor.role}) - ${role}`);
    });

    if (potentialSupervisors.length === 0) {
      console.log('❌ No supervisors found to assign users to!');
      return;
    }

    // Create relations to connect unconnected users
    const newRelations = [];
    
    for (let i = 0; i < unconnectedUsers.length; i++) {
      const user = unconnectedUsers[i];
      const supervisor = potentialSupervisors[i % potentialSupervisors.length];
      
      // Skip if trying to connect CEO to themselves
      if (user.id === supervisor.id) {
        continue;
      }
      
      newRelations.push({
        fromId: supervisor.id,
        toId: user.id,
        type: supervisor.isLead ? 'LEAD' : 'MANAGER'
      });
    }

    console.log(`🔗 Creating ${newRelations.length} new relations...`);

    // Insert the new relations
    for (const relation of newRelations) {
      await prisma.employeeRelation.upsert({
        where: {
          fromId_toId_type: {
            fromId: relation.fromId,
            toId: relation.toId,
            type: relation.type as 'MANAGER' | 'LEAD' | 'COLLEAGUE'
          }
        },
        update: {
          fromId: relation.fromId,
          toId: relation.toId,
          type: relation.type as 'MANAGER' | 'LEAD' | 'COLLEAGUE'
        },
        create: {
          fromId: relation.fromId,
          toId: relation.toId,
          type: relation.type as 'MANAGER' | 'LEAD' | 'COLLEAGUE'
        },
      });
    }

    // Verify the fix
    const finalRelations = await prisma.employeeRelation.findMany();
    const finalUsersWithRelations = new Set();
    finalRelations.forEach(rel => finalUsersWithRelations.add(rel.toId));
    const stillUnconnected = allUsers.filter(user => !finalUsersWithRelations.has(user.id));

    console.log('✅ Fix completed!');
    console.log(`📊 Final stats:`);
    console.log(`  👥 Total Users: ${allUsers.length}`);
    console.log(`  🔗 Total Relations: ${finalRelations.length}`);
    console.log(`  ❌ Still Unconnected: ${stillUnconnected.length}`);

    if (stillUnconnected.length > 0) {
      console.log('⚠️  Still unconnected users:');
      stillUnconnected.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName}`);
      });
    } else {
      console.log('🎉 All users are now connected!');
    }

  } catch (error) {
    console.error('❌ Error fixing unconnected users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use
export { fixUnconnectedUsers };

// Run if called directly
if (require.main === module) {
  fixUnconnectedUsers()
    .then(() => {
      console.log('🎉 Fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fix failed:', error);
      process.exit(1);
    });
} 