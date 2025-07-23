import { google } from 'googleapis';

const SHEET_NAME = 'Sheet1';

export interface OnboardingRequest {
    rowNumber: number;
    userId: string;
    name: string;
    manager: string;
    role: string;
    submitted: string;
    approved: string;
}

export interface EmployeeForm {
    name?: string;
    questions?: string[];
}

export interface Employee {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isManager: boolean;
  isLead: boolean;
}

async function createGoogleSheetsClient() {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    throw new Error('Missing required environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();

  const sheets = google.sheets({
    version: 'v4',
    auth: authClient as any,
  });

  return { sheets, sheetId: GOOGLE_SHEET_ID };
}

export async function fetchPendingApprovals(): Promise<OnboardingRequest[]> {
    const { sheets, sheetId } = await createGoogleSheetsClient();

    const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:K`, // Updated range for new columns
    });

    const values = getRes.data.values || [];
    if (values.length < 2) {
        return [];
    }

    const headers = values[0].map((h: string) => h.trim().toLowerCase());
    const expectedHeaders = ['first name', 'last name', 'email', 'userid', 'manager', 'role', 'submitted', 'approved'];
    if (!expectedHeaders.every(h => headers.includes(h))) {
        console.error("Sheet is missing required headers. Found:", headers);
        throw new Error('Sheet is missing required headers: first name, last name, email, userid, manager, role, submitted, approved');
    }

    const pending: OnboardingRequest[] = [];
    values.slice(1).forEach((row, index) => {
        const request: any = {};
        headers.forEach((header, i) => {
            request[header] = row[i] || '';
        });

        if ((request.submitted || '').toLowerCase() === 'yes' && (request.approved || '').toLowerCase() !== 'yes') {
            pending.push({
                rowNumber: index + 2,
                userId: request.userid,
                name: `${request['first name']} ${request['last name']}`.trim(),
                manager: request.manager,
                role: request.role,
                submitted: request.submitted,
                approved: request.approved,
            });
        }
    });

    return pending;
}

export async function approveRequest(rowNumber: number): Promise<void> {
    const { sheets, sheetId } = await createGoogleSheetsClient();
    const range = `${SHEET_NAME}!K${rowNumber}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['yes']],
        },
    });
}

export async function isUserApproved(userId: string): Promise<boolean> {
    const { sheets, sheetId } = await createGoogleSheetsClient();

    const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:K`,
    });

    const values = getRes.data.values || [];

    const headers = values[0].map((h: string) => h.trim().toLowerCase());
    const userIdIndex = headers.indexOf('userid');
    const approvedIndex = headers.indexOf('approved');

    if (userIdIndex === -1 || approvedIndex === -1) {
        console.error('Sheet must contain "userid" and "approved" columns');
        return false;
    }

    return values.slice(1).some(row =>
        (row[userIdIndex] || '') === userId &&
        (row[approvedIndex] || '').toLowerCase() === 'yes'
    );
}

export async function fetchResponses(): Promise<EmployeeForm[]> {
  const { sheets, sheetId } = await createGoogleSheetsClient();

  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A1:Z`,
  });

  const values = getRes.data.values || [];
  if (values.length < 2) {
    // No data or only headers
    return [];
  }

  const headers = values[0].map((h: string) => h.trim().toLowerCase());
  const responses: EmployeeForm[] = values.slice(1).map((row) => {
    const job: any = {};
    headers.forEach((header, i) => {
      job[header] = row[i] || '';
    });
    return job;
  });

  return responses;
}

export async function hasUserSubmitted(userId: string): Promise<boolean> {
    const { sheets, sheetId } = await createGoogleSheetsClient();

    const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:K`,
    });

    const values = getRes.data.values || [];
    if (values.length < 2) {
        return false;
    }

    const headers = values[0].map((h: string) => h.trim().toLowerCase());
    const userIdIndex = headers.indexOf('userid');

    if (userIdIndex === -1) {
        return false;
    }

    return values.slice(1).some(row => (row[userIdIndex] || '') === userId);
}

export async function fetchManagersAndLeads(): Promise<Employee[]> {
  const { sheets, sheetId } = await createGoogleSheetsClient();

  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A1:K`,
  });

  const values = getRes.data.values || [];
  if (values.length < 2) {
    // If no data exists, return empty array
    return [];
  }

  const headers = values[0].map((h: string) => h.trim().toLowerCase());
  const expectedHeaders = ['first name', 'last name', 'email', 'userid', 'department', 'role', 'is manager', 'is lead', 'manager', 'submitted', 'approved'];
  
  if (!expectedHeaders.every(h => headers.includes(h))) {
    console.error("Sheet is missing required headers. Found:", headers);
    throw new Error('Sheet is missing required headers');
  }

  const employees: Employee[] = [];
  values.slice(1).forEach((row) => {
    const employee: any = {};
    headers.forEach((header, i) => {
      employee[header] = row[i] || '';
    });

    // Only include approved employees who are managers or leads
    if ((employee.approved || '').toLowerCase() === 'yes' && 
        ((employee['is manager'] || '').toLowerCase() === 'yes' || 
         (employee['is lead'] || '').toLowerCase() === 'yes')) {
      employees.push({
        userId: employee.userid,
        name: `${employee['first name']} ${employee['last name']}`.trim(),
        email: employee.email,
        department: employee.department,
        role: employee.role,
        isManager: (employee['is manager'] || '').toLowerCase() === 'yes',
        isLead: (employee['is lead'] || '').toLowerCase() === 'yes',
      });
    }
  });

  return employees;
}

export async function fetchDepartmentEmployees(department: string): Promise<Employee[]> {
  const { sheets, sheetId } = await createGoogleSheetsClient();

  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A1:K`,
  });

  const values = getRes.data.values || [];
  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map((h: string) => h.trim().toLowerCase());
  const expectedHeaders = ['first name', 'last name', 'email', 'userid', 'department', 'role', 'is manager', 'is lead', 'manager', 'submitted', 'approved'];
  
  if (!expectedHeaders.every(h => headers.includes(h))) {
    console.error("Sheet is missing required headers. Found:", headers);
    throw new Error('Sheet is missing required headers');
  }

  const employees: Employee[] = [];
  values.slice(1).forEach((row) => {
    const employee: any = {};
    headers.forEach((header, i) => {
      employee[header] = row[i] || '';
    });

    // Only include approved employees from the specified department
    if ((employee.approved || '').toLowerCase() === 'yes' && 
        (employee.department || '').toLowerCase() === department.toLowerCase()) {
      employees.push({
        userId: employee.userid,
        name: `${employee['first name']} ${employee['last name']}`.trim(),
        email: employee.email,
        department: employee.department,
        role: employee.role,
        isManager: (employee['is manager'] || '').toLowerCase() === 'yes',
        isLead: (employee['is lead'] || '').toLowerCase() === 'yes',
      });
    }
  });

  return employees;
}

export async function fetchDepartments(): Promise<string[]> {
  const { sheets, sheetId } = await createGoogleSheetsClient();

  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A1:K`,
  });

  const values = getRes.data.values || [];
  if (values.length < 2) {
    // If no data exists, return default departments
    return [
      "Executive",
      "Engineering",
      "Product", 
      "Design",
      "Sales",
      "Marketing",
      "Operations",
      "Finance",
      "HR"
    ];
  }

  const headers = values[0].map((h: string) => h.trim().toLowerCase());
  const departmentIndex = headers.indexOf('department');

  if (departmentIndex === -1) {
    // If department column doesn't exist, return default departments
    return [
      "Executive",
      "Engineering",
      "Product", 
      "Design",
      "Sales",
      "Marketing",
      "Operations",
      "Finance",
      "HR"
    ];
  }

  const departments = new Set<string>();
  values.slice(1).forEach((row) => {
    const department = row[departmentIndex];
    if (department && (row[headers.indexOf('approved')] || '').toLowerCase() === 'yes') {
      departments.add(department);
    }
  });

  // If no departments found from approved users, return default departments
  if (departments.size === 0) {
    return [
      "Executive",
      "Engineering",
      "Product", 
      "Design",
      "Sales",
      "Marketing",
      "Operations",
      "Finance",
      "HR"
    ];
  }

  return Array.from(departments).sort();
}