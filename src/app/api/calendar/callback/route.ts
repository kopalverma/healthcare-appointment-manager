import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("=================================");
    console.log("GOOGLE REFRESH TOKEN:");
    console.log(tokens.refresh_token);
    console.log("=================================");

    return NextResponse.json({
      success: true,
      message: "Google Calendar connected successfully. Check terminal for refresh token.",
    });
  } catch (error) {
    console.error("Google OAuth error:", error);

    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 500 }
    );
  }
}