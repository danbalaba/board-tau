import { NextResponse } from 'next/server';
import { RekognitionClient, GetFaceLivenessSessionResultsCommand } from '@aws-sdk/client-rekognition';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required sessionId parameter.' },
        { status: 400 }
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: 'AWS Rekognition credentials not configured in environment variables.' },
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

    const getResultsCmd = new GetFaceLivenessSessionResultsCommand({
      SessionId: sessionId,
    });

    const results = await livenessClient.send(getResultsCmd);
    const confidence = results.Confidence ?? 0;
    const isLive = results.Status === 'SUCCEEDED' && confidence >= 85;

    let referenceImageBase64: string | null = null;

    if (results.ReferenceImage?.Bytes) {
      const buffer = Buffer.from(results.ReferenceImage.Bytes);
      referenceImageBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    if (!isLive) {
      return NextResponse.json({
        success: false,
        status: results.Status || 'FAILED',
        confidence: Math.round(confidence),
        reason: 'Liveness check unconfirmed. Please position your face clearly in the camera frame.',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'SUCCEEDED',
      confidence: Math.round(confidence),
      referenceImage: referenceImageBase64,
    });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[AWS Liveness Results Error]:', msg);
    return NextResponse.json(
      { error: 'Failed to retrieve liveness session results', details: msg },
      { status: 500 }
    );
  }
}
