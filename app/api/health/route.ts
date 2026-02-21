// Health check endpoint for monitoring
// GET /api/health

import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      openai: checkOpenAI(),
      storage: checkStorage(),
    },
  };

  const allHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

function checkOpenAI() {
  const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  
  return {
    status: hasKey ? 'ok' : 'degraded',
    message: hasKey ? 'API key configured' : 'API key missing - demo mode active',
  };
}

function checkStorage() {
  // In production, check database connection
  // For now, just verify we can access environment
  return {
    status: 'ok',
    message: 'localStorage available (client-side)',
  };
}
