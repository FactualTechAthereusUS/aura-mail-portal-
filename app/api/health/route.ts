import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const dbHealthy = await testConnection();
    
    if (dbHealthy) {
      return NextResponse.json({
        status: 'healthy',
        message: 'AuraMail Employee Portal is operational',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          database: 'disconnected'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
} 