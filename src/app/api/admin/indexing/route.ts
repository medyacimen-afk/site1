import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { url, type } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const credentialsString = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT;
    if (!credentialsString) {
      return NextResponse.json({ 
        error: 'GOOGLE_INDEXING_SERVICE_ACCOUNT ortam değişkeni Vercel\'e eklenmemiş! Vercel Dashboard > Settings > Environment Variables kısmına ekleyin.',
        hint: 'env_missing'
      }, { status: 500 });
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsString);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Service account JSON parse hatası. Vercel\'deki değeri kontrol edin.',
        hint: 'json_parse_error'
      }, { status: 500 });
    }

    // Ensure private key is correctly formatted regardless of how it was injected
    let privateKey = credentials.private_key || '';
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
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
    
    // Google API'den gelen spesifik hata mesajları
    const googleError = error.response?.data?.error;
    const errorMessage = googleError?.message || error.message || 'Internal Server Error';
    const errorCode = googleError?.code || error.code;
    
    return NextResponse.json({ 
      error: errorMessage,
      code: errorCode,
      details: googleError || null,
      hint: errorCode === 403 ? 'Google Search Console\'da bu siteyi sahip olarak doğrulamanız gerekiyor.' : null
    }, { status: 500 });
  }
}
