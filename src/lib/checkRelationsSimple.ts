import { execSync } from 'child_process';

try {
  console.log('🔍 Checking database relations...\n');
  
  // Use npx prisma db execute to run a simple query
                const result = execSync('npx prisma db execute --schema=./prisma/schema.prisma --stdin', {
    input: `
      SELECT 
        er.id,
        er."fromId",
        er."toId", 
        er.type,
        e1."firstName" as from_first_name,
        e1."lastName" as from_last_name,
        e1.role as from_role,
        e2."firstName" as to_first_name,
        e2."lastName" as to_last_name,
        e2.role as to_role
      FROM "EmployeeRelation" er
      JOIN "Employee" e1 ON er."fromId" = e1.id
      JOIN "Employee" e2 ON er."toId" = e2.id;
    `,
    encoding: 'utf8'
  });
  
  console.log('📊 Relations found:');
  console.log(result);
  
  // Also check all employees
                const employeesResult = execSync('npx prisma db execute --schema=./prisma/schema.prisma --stdin', {
    input: `
      SELECT id, "firstName", "lastName", role, "isManager", "isLead"
      FROM "Employee"
      ORDER BY "createdAt";
    `,
    encoding: 'utf8'
  });
  
  console.log('\n👥 All employees:');
  console.log(employeesResult);
  
} catch (error) {
  console.error('❌ Error:', error);
} 