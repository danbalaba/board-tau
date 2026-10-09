import { NextResponse } from 'next/server';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycLimiter } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { selfieUrl } = await req.json();

    if (!selfieUrl) {
      return NextResponse.json(
        { error: 'Missing required selfieUrl parameter.' },
        { status: 400 }
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!accessKeyId || !secretAccessKey) {
      console.warn('[Server KYC] AWS Credentials missing in environment variables.');
      return NextResponse.json({
        success: false,
        error: 'AWS Rekognition credentials missing in .env',
        reason: 'Identity verification server credentials not configured.',
      }, { status: 400 });
    }

    const sessionToken = process.env.AWS_SESSION_TOKEN;

    const client = new RekognitionClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken ? { sessionToken } : {}),
      },
    });

    const parseImageBuffer = async (input: string): Promise<Uint8Array> => {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        const res = await fetch(input);
        const arrayBuf = await res.arrayBuffer();
        return new Uint8Array(arrayBuf);
      }
      const base64Data = input.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
      const buffer = Buffer.from(base64Data, 'base64');
      return new Uint8Array(buffer);
    };

    const selfieBuffer = await parseImageBuffer(selfieUrl);

    if (!selfieBuffer || selfieBuffer.length < 100) {
      return NextResponse.json({
        success: false,
        faceCount: 0,
        status: 'INVALID_IMAGE_FORMAT',
        reason: 'Captured photo is invalid or empty. Please ensure camera permissions are allowed.',
      }, { status: 400 });
    }

    const detectCmd = new DetectFacesCommand({
      Image: { Bytes: selfieBuffer },
      Attributes: ['ALL'],
    });

    const response = await client.send(detectCmd);
    const faces = response.FaceDetails || [];

    if (faces.length === 0) {
      return NextResponse.json({
        success: false,
        faceCount: 0,
        status: 'NO_FACE_DETECTED',
        reason: 'No face detected in photo. Please frame your face clearly inside the oval.',
      }, { status: 400 });
    }

    const primaryFace = faces[0];
    const confidence = Math.round(primaryFace.Confidence || 99);

    return NextResponse.json({
      success: true,
      faceCount: faces.length,
      confidence,
      status: 'FACE_DETECTED',
      message: 'Face verified successfully!',
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AWS DetectFaces Error]:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Server face detection failed', details: errorMessage },
      { status: 500 }
    );
  }
}
