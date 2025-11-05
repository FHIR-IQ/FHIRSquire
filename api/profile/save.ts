import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, filename } = req.body;

    if (!profile || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a serverless environment, we can't save to filesystem
    // Instead, return the profile as downloadable JSON
    const jsonString = JSON.stringify(profile, null, 2);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Profile ready for download',
        filename: filename.endsWith('.json') ? filename : `${filename}.json`,
        content: jsonString,
        size: Buffer.byteLength(jsonString, 'utf8')
      }
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
