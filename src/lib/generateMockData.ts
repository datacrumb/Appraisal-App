import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Sample data from your Google Sheet
const rawEmployeeData = [
  { firstName: 'Khurram', lastName: 'Sadiq', department: 'Human Resource', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Shariq', lastName: 'Siddqui', department: 'Business Development', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Ameer', lastName: 'Hamza', department: 'Projects', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Qumber', lastName: 'Rizvi', department: 'Projects', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Sehrish', lastName: 'Sehrish', department: 'Human Resource', role: 'Executive', isManager: false, isLead: true },
  { firstName: 'Abid', lastName: 'Abid', department: 'Human Resource', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Zehra', lastName: 'Naqvi', department: 'Proposals', role: 'Executive', isManager: false, isLead: true },
  { firstName: 'Hammad', lastName: 'Siddiqui', department: 'Proposals', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Erdum', lastName: 'Noor', department: 'Proposals', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Yaseen', lastName: 'Muhammad', department: 'Proposals', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Faraz', lastName: 'Ahmed', department: 'Planning', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Wahiba', lastName: 'Wahiba', department: 'Planning', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Sheheryar', lastName: 'Sheheryar', department: 'HSE', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Shahzain', lastName: 'Shahzain', department: 'HSE', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Ali', lastName: 'Akber', department: 'Quality', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Amir', lastName: 'Syed', department: 'Procurement', role: 'Executive', isManager: false, isLead: true },
  { firstName: 'Ali', lastName: 'Raza', department: 'Procurement', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Yawer', lastName: 'Abbas', department: 'Procurement', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Kashif', lastName: 'Kashif', department: 'Accounts', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Ghulam', lastName: 'Ghulam', department: 'Accounts', role: 'Executive', isManager: false, isLead: true },
  { firstName: 'Askari', lastName: 'Askari', department: 'Accounts', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Haris', lastName: 'Haris', department: 'Accounts', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Asad', lastName: 'Asad', department: 'Accounts', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Mehdi', lastName: 'Mehdi', department: 'Accounts', role: 'Employee', isManager: false, isLead: false },
  { firstName: 'Ahtesham', lastName: 'Ahtesham', department: 'Taxation', role: 'Manager', isManager: true, isLead: false },
  { firstName: 'Imtiaz', lastName: 'Imtiaz', department: 'Taxation', role: 'Employee', isManager: false, isLead: false },
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

// Generate email from first and last name
function generateEmail(firstName: string, lastName: string): string {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirstName}.${cleanLastName}@gasco.com`;
}

// Generate sample phone numbers
function generatePhoneNumber(): string {
  const areaCodes = ['0300', '0301', '0302', '0303', '0304', '0305', '0306', '0307', '0308', '0309'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return `+92${areaCode}${number}`;
}

// Generate sample profile picture URLs
function generateProfilePicture(firstName: string, lastName: string): string {
  const pictures = [
    '/images/picture1.jpg',
    '/images/picture2.jpg', 
    '/images/picture3.jpg',
    '/images/Capture1.PNG',
    '/images/Capture2.PNG'
  ];
  return pictures[Math.floor(Math.random() * pictures.length)];
}

async function generateMockData() {
  console.log('🚀 Generating mock data for GASCO employees...');

  try {
    // Check for existing CEOs and Directors first
    console.log('👑 Checking for existing CEOs and Directors...');
    const existingCEOs = await prisma.employee.findMany({
      where: {
        OR: [
          { role: { contains: 'CEO' } },
          { role: { contains: 'Technical Director' } },
          { role: { contains: 'Director' } }
        ]
      }
    });

    console.log(`👑 Found ${existingCEOs.length} existing CEOs/Directors:`);
    existingCEOs.forEach(ceo => {
      console.log(`  - ${ceo.firstName} ${ceo.lastName} (${ceo.role})`);
    });

    // Clear only non-CEO/Director data
    console.log('🧹 Clearing existing non-CEO/Director data...');
    await prisma.employeeRelation.deleteMany();
    
    // Delete only non-CEO/Director employees
    const deletedEmployees = await prisma.employee.deleteMany({
      where: {
        AND: [
          { role: { not: { contains: 'CEO' } } },
          { role: { not: { contains: 'Technical Director' } } },
          { role: { not: { contains: 'Director' } } }
        ]
      }
    });
    
    console.log(`✅ Deleted ${deletedEmployees.count} non-CEO/Director employees`);

    // Generate complete employee data
    const employees = rawEmployeeData.map(emp => ({
      id: generateClerkUserId(),
      email: generateEmail(emp.firstName, emp.lastName),
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      role: emp.role,
      isManager: emp.isManager,
      isLead: emp.isLead,
      profilePictureUrl: generateProfilePicture(emp.firstName, emp.lastName),
      phoneNumber: generatePhoneNumber(),
    }));

    console.log('👥 Generated employee data:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Department: ${emp.department}`);
      console.log(`   Role: ${emp.role}`);
      console.log(`   Manager: ${emp.isManager}, Lead: ${emp.isLead}`);
      console.log(`   Phone: ${emp.phoneNumber}`);
      console.log('---');
    });

    // Insert employees
    console.log('\n💾 Inserting employees into database...');
    for (const emp of employees) {
      await prisma.employee.create({
        data: emp,
      });
    }

    // Create relations based on department hierarchy
    console.log('\n🔗 Creating employee relations...');
    const relations: Array<{
      fromId: string;
      toId: string;
      type: 'MANAGER' | 'LEAD' | 'COLLEAGUE';
    }> = [];

    // Combine existing CEOs with new employees for relations
    const allEmployees = [...existingCEOs, ...employees] as typeof existingCEOs;
    
    // Group by department
    const departmentGroups = new Map<string, typeof allEmployees>();
    allEmployees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!departmentGroups.has(dept)) {
        departmentGroups.set(dept, []);
      }
      departmentGroups.get(dept)!.push(emp);
    });

    // Create relations within each department
    departmentGroups.forEach((deptEmployees, department) => {
      const managers = deptEmployees.filter(emp => emp.isManager);
      const executives = deptEmployees.filter(emp => emp.isLead);
      const employees = deptEmployees.filter(emp => !emp.isManager && !emp.isLead);

      // Assign executives to managers (CEO/Director → Manager → Executive)
      executives.forEach((executive, index) => {
        if (managers.length > 0) {
          const manager = managers[index % managers.length];
          relations.push({
            fromId: manager.id,
            toId: executive.id,
            type: 'MANAGER' as const,
          });
        }
      });

      // Assign employees to executives (Manager → Executive → Employee)
      employees.forEach((employee, index) => {
        if (executives.length > 0) {
          const executive = executives[index % executives.length];
          relations.push({
            fromId: executive.id,
            toId: employee.id,
            type: 'MANAGER' as const,
          });
        } else if (managers.length > 0) {
          // If no executives, assign directly to managers
          const manager = managers[index % managers.length];
          relations.push({
            fromId: manager.id,
            toId: employee.id,
            type: 'MANAGER' as const,
          });
        }
      });
    });

    // Connect all department managers to CEOs/Directors
    if (existingCEOs.length > 0) {
      const allManagers = allEmployees.filter(emp => emp.isManager && !existingCEOs.includes(emp));
      
      allManagers.forEach((manager, index) => {
        const ceo = existingCEOs[index % existingCEOs.length];
        relations.push({
          fromId: ceo.id,
          toId: manager.id,
          type: 'MANAGER' as const,
        });
      });
    }

    // Insert relations
    for (const relation of relations) {
      await prisma.employeeRelation.create({
        data: relation,
      });
    }

    // Final stats
    const finalEmployees = await prisma.employee.findMany();
    const finalRelations = await prisma.employeeRelation.findMany();

    console.log('\n✅ Mock data generation completed!');
    console.log(`📊 Final stats:`);
    console.log(`  👥 Total Employees: ${finalEmployees.length}`);
    console.log(`  🔗 Total Relations: ${finalRelations.length}`);
    console.log(`  👑 CEOs/Directors: ${finalEmployees.filter(u => u.role?.includes('CEO') || u.role?.includes('Director')).length}`);
    console.log(`  👨‍💼 Managers: ${finalEmployees.filter(u => u.isManager).length}`);
    console.log(`  👤 Executives: ${finalEmployees.filter(u => u.isLead).length}`);
    console.log(`  👥 Employees: ${finalEmployees.filter(u => !u.isManager && !u.isLead).length}`);

    // Show departments
    const departments = [...new Set(finalEmployees.map(emp => emp.department))];
    console.log(`🏢 Departments: ${departments.join(', ')}`);

    console.log('\n📋 Sample emails generated:');
    employees.slice(0, 5).forEach(emp => {
      console.log(`  ${emp.firstName} ${emp.lastName}: ${emp.email}`);
    });

  } catch (error) {
    console.error('❌ Error generating mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use
export { generateMockData };

// Run if called directly
if (require.main === module) {
  generateMockData()
    .then(() => {
      console.log('🎉 Mock data generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mock data generation failed:', error);
      process.exit(1);
    });
} 