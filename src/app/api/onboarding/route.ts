import { currentUser } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { isCompanyEmail } from "@/lib/emailValidation";

const SHEET_NAME = "Sheet1";

async function createGoogleSheetsClient() {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } =
    process.env;

  if (
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_PRIVATE_KEY ||
    !GOOGLE_SHEET_ID
  ) {
    throw new Error("Missing required environment variables for Google Sheets");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({
    version: "v4",
    auth: authClient as any,
  });

  return { sheets, sheetId: GOOGLE_SHEET_ID };
}

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  // Check email domain
  const userEmail = user.emailAddresses?.[0]?.emailAddress;
  if (!userEmail || !isCompanyEmail(userEmail)) {
    return NextResponse.json({ error: "Unauthorized email domain" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const department = formData.get('department') as string;
    const role = formData.get('role') as string;
    const isManager = formData.get('isManager') as string;
    const isLead = formData.get('isLead') as string;
    const manager = formData.get('manager') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    const { sheets, sheetId } = await createGoogleSheetsClient();

    // Upload profile picture to Clerk if provided
    if (profilePicture) {
      await uploadProfilePictureToClerk(user.id, profilePicture);
    }

    // Save to Google Sheet with correct format and all fields
    const values = [[
      user.firstName || "",           // First Name
      user.lastName || "",            // Last Name
      userEmail,                      // Email
      user.id,                        // UserId
      department,                     // Department
      role,                           // Role
      isManager === 'true' ? 'yes' : 'no',  // Is Manager
      isLead === 'true' ? 'yes' : 'no',     // Is Lead
      manager,                        // Manager
      'yes',                          // Submitted
      ''                              // Approved (empty initially)
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit onboarding request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function uploadProfilePictureToClerk(userId: string, file: File): Promise<void> {
  // This is a placeholder. You'll need to implement the actual Clerk API call
  // to upload the profile picture. You can use the Clerk API or SDK.
  console.log(`Uploading profile picture for user ${userId}`);
  // Implementation depends on your Clerk setup and requirements
}
