import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'FHIRSquire API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      useCase: {
        analyze: '/api/use-case/analyze',
        generateSpec: '/api/use-case/generate-spec'
      },
      profile: {
        generate: '/api/profile/generate',
        validate: '/api/profile/validate',
        save: '/api/profile/save',
        list: '/api/profile/list'
      }
    },
    timestamp: new Date().toISOString()
  });
}
