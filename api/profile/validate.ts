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
    const { resource, profile } = req.body;

    if (!resource || !profile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic validation - check required fields
    const errors: string[] = [];

    // Validate resource type matches profile
    if (resource.resourceType !== profile.type) {
      errors.push(`Resource type ${resource.resourceType} does not match profile type ${profile.type}`);
    }

    // Check for must-support elements
    if (profile.differential && profile.differential.element) {
      const mustSupportElements = profile.differential.element.filter((el: any) => el.mustSupport);

      mustSupportElements.forEach((element: any) => {
        const path = element.path.replace(`${profile.type}.`, '');
        const value = getNestedValue(resource, path);

        if (value === undefined || value === null) {
          errors.push(`Missing must-support element: ${path}`);
        }
      });
    }

    // Check cardinality constraints
    if (profile.differential && profile.differential.element) {
      profile.differential.element.forEach((element: any) => {
        if (element.min !== undefined) {
          const path = element.path.replace(`${profile.type}.`, '');
          const value = getNestedValue(resource, path);

          if (element.min > 0 && (value === undefined || value === null)) {
            errors.push(`Required element missing (min=${element.min}): ${path}`);
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors
      }
    });
  } catch (error) {
    console.error('Error validating profile:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
