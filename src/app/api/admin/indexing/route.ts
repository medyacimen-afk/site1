import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, type } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const credentialsString = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT;
    if (!credentialsString) {
      return NextResponse.json({ error: 'Google Indexing credentials not configured' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsString);

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing('v3');

    const response = await indexing.urlNotifications.publish({
      auth,
      requestBody: {
        url,
        type: type || 'URL_UPDATED',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Indexing request sent successfully',
      data: response.data 
    });
  } catch (error: any) {
    console.error('Indexing API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: error.response?.data || null
    }, { status: 500 });
  }
}
