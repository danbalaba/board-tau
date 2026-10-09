import { NextResponse } from 'next/server';
import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to perform biometric check.' },
        { status: 401 }
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { 
          error: 'AWS Rekognition credentials not configured in environment variables.',
          reason: 'AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing in .env' 
        },
        { status: 400 }
      );
    }

    const sessionToken = process.env.AWS_SESSION_TOKEN;

    const livenessClient = new RekognitionClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken ? { sessionToken } : {}),
      },
    });

    const createCmd = new CreateFaceLivenessSessionCommand({
      Settings: {
        AuditImagesLimit: 1,
      },
    });

    const response = await livenessClient.send(createCmd);
    const sessionId = response.SessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Failed to generate AWS Liveness Session ID.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      region,
    });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[AWS Liveness Session Error]:', msg);
    return NextResponse.json(
      { error: 'Failed to initialize liveness session', details: msg },
      { status: 500 }
    );
  }
}
