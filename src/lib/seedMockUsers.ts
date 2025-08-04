import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Mock data for generating realistic users
const departments = [
  'Engineering',
  'Product Management', 
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Research & Development'
];

const roles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Engineer',
  'Engineering Manager',
  'Product Manager',
  'Senior Product Manager',
  'Product Director',
  'UX Designer',
  'Senior UX Designer',
  'Design Lead',
  'Marketing Manager',
  'Marketing Director',
  'Sales Representative',
  'Sales Manager',
  'Sales Director',
  'HR Specialist',
  'HR Manager',
  'Financial Analyst',
  'Finance Manager',
  'Operations Manager',
  'Customer Success Manager',
  'Research Scientist',
  'Data Scientist'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const profilePictures = [
  '/images/picture1.jpg',
  '/images/picture2.jpg', 
  '/images/picture3.jpg',
  '/images/Capture1.PNG',
  '/images/Capture2.PNG'
];

// Generate Clerk-like user IDs
function generateClerkUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'user_';
  for (let i = 0; i < 22; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate realistic email
function generateEmail(firstName: string, lastName: string): string {
  const domains = ['company.com', 'techcorp.com', 'innovate.io', 'futureworks.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

async function seedMockUsers() {
  console.log('🌱 Starting to seed mock users...');

  try {
    // Check existing users first
    console.log('🔍 Checking existing users...');
    const existingUsers = await prisma.employee.findMany({
      include: {
        relationsFrom: true,
        relationsTo: true
      }
    });

    console.log(`📊 Found ${existingUsers.length} existing users`);

    if (existingUsers.length > 0) {
      console.log('👥 Existing users:');
      existingUsers.forEach(user => {
        const role = user.isManager ? 'Manager' : user.isLead ? 'Lead' : 'Employee';
        console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${role}`);
      });
    }

    // Find existing CEO/Admin and managers
    const existingCEO = existingUsers.find(u => u.isManager && u.role?.toLowerCase().includes('ceo'));
    const existingManagers = existingUsers.filter(u => u.isManager && !u.role?.toLowerCase().includes('ceo'));
    const existingLeads = existingUsers.filter(u => u.isLead);

    console.log(`👑 Existing CEO: ${existingCEO ? `${existingCEO.firstName} ${existingCEO.lastName}` : 'None'}`);
    console.log(`👨‍💼 Existing Managers: ${existingManagers.length}`);
    console.log(`👥 Existing Leads: ${existingLeads.length}`);

    // Generate new users to add (avoiding conflicts)
    const usersToAdd = [];
    const targetTotalUsers = 40;
    const usersNeeded = Math.max(0, targetTotalUsers - existingUsers.length);

    console.log(`➕ Need to add ${usersNeeded} more users to reach ${targetTotalUsers} total`);

    if (usersNeeded > 0) {
      // Generate new individual contributors and some additional leads
      for (let i = 0; i < usersNeeded; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        // Lower probability for managers/leads since you already have some
        const isManager = Math.random() < 0.05; // 5% chance
        const isLead = Math.random() < 0.1; // 10% chance
        
        usersToAdd.push({
          id: generateClerkUserId(),
          firstName,
          lastName,
          email: generateEmail(firstName, lastName),
          department,
          role,
          isManager,
          isLead,
          profilePictureUrl: profilePictures[Math.floor(Math.random() * profilePictures.length)]
        });
      }

      // Insert new users
      console.log('👥 Inserting new users...');
      for (const user of usersToAdd) {
        await prisma.employee.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }

      // Create relations for new users
      console.log('🔗 Creating relations for new users...');
      const newUsers = usersToAdd.filter(u => !u.isManager && !u.isLead);
      const newLeads = usersToAdd.filter(u => u.isLead);
      const newManagers = usersToAdd.filter(u => u.isManager);

      const relations = [];

      // First, assign new leads to existing managers
      const allManagers = [...existingManagers, ...newManagers];
      for (let i = 0; i < newLeads.length; i++) {
        const manager = allManagers[i % allManagers.length];
        const lead = newLeads[i];
        
        if (manager && lead) {
          relations.push({
            fromId: manager.id,
            toId: lead.id,
            type: 'MANAGER'
          });
        }
      }

      // Then, assign ALL new individual contributors to either existing leads, new leads, or existing managers
      const allLeads = [...existingLeads, ...newLeads];
      const allSupervisors = [...allLeads, ...allManagers]; // Include managers as fallback
      
      // Ensure every new user gets assigned to someone
      for (let i = 0; i < newUsers.length; i++) {
        const contributor = newUsers[i];
        const supervisor = allSupervisors[i % allSupervisors.length];
        
        if (supervisor && contributor) {
          relations.push({
            fromId: supervisor.id,
            toId: contributor.id,
            type: allLeads.includes(supervisor) ? 'LEAD' : 'MANAGER'
          });
        }
      }

      // If we still have unassigned users, assign them to the CEO or any existing manager
      const assignedUserIds = new Set(relations.map(r => r.toId));
      const unassignedUsers = newUsers.filter(u => !assignedUserIds.has(u.id));
      
      if (unassignedUsers.length > 0 && (existingCEO || allManagers.length > 0)) {
        const fallbackSupervisor = existingCEO || allManagers[0];
        
        for (const unassignedUser of unassignedUsers) {
          relations.push({
            fromId: fallbackSupervisor.id,
            toId: unassignedUser.id,
            type: 'MANAGER'
          });
        }
      }

      // Also handle any existing unconnected users
      const allExistingUsers = await prisma.employee.findMany();
      const usersWithRelations = new Set();
      
      // Get all users who have incoming relations
      const allRelations = await prisma.employeeRelation.findMany();
      allRelations.forEach(rel => usersWithRelations.add(rel.toId));
      
      // Find users without any incoming relations (unconnected)
      const unconnectedUsers = allExistingUsers.filter(user => !usersWithRelations.has(user.id));
      
      if (unconnectedUsers.length > 0 && (existingCEO || allManagers.length > 0)) {
        console.log(`🔗 Found ${unconnectedUsers.length} existing unconnected users, assigning them...`);
        
        const fallbackSupervisor = existingCEO || allManagers[0];
        
        for (const unconnectedUser of unconnectedUsers) {
          // Skip if this is the CEO/admin
          if (unconnectedUser.isManager && unconnectedUser.role?.toLowerCase().includes('ceo')) {
            continue;
          }
          
          relations.push({
            fromId: fallbackSupervisor.id,
            toId: unconnectedUser.id,
            type: 'MANAGER'
          });
        }
      }

      // Insert relations
      for (const relation of relations) {
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

      console.log('✅ Successfully added new users!');
      console.log(`📊 Added ${usersToAdd.length} new users with ${relations.length} relations`);
      
      // Log final stats
      const finalUsers = await prisma.employee.findMany();
      const finalRelations = await prisma.employeeRelation.findMany();
      
      console.log(`📈 Final stats:`);
      console.log(`  👥 Total Users: ${finalUsers.length}`);
      console.log(`  🔗 Total Relations: ${finalRelations.length}`);
      console.log(`  👨‍💼 Managers: ${finalUsers.filter(u => u.isManager).length}`);
      console.log(`  👥 Leads: ${finalUsers.filter(u => u.isLead).length}`);
      console.log(`  👤 Individual Contributors: ${finalUsers.filter(u => !u.isManager && !u.isLead).length}`);

    } else {
      console.log('✅ Already have 40+ users! No new users needed.');
    }

  } catch (error) {
    console.error('❌ Error seeding mock users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use
export { seedMockUsers };

// Run if called directly
if (require.main === module) {
  seedMockUsers()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
} 