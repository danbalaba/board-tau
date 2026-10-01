class FaceMatcherEngine {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private faceapi: any = null;

  public async loadModels() {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        if (typeof window === 'undefined') return; // Skip SSR

        // Dynamically import to avoid SSR TextEncoder error
        this.faceapi = await import('@vladmandic/face-api');
        const MODEL_URL = '/models/face-api';
        
        if (this.faceapi.tf) {
          try {
            await this.faceapi.tf.ready();
          } catch (tfErr) {
            console.warn('[FaceMatcher] WebGL backend init failed, switching to CPU:', tfErr);
            await this.faceapi.tf.setBackend('cpu');
          }
        }

        await Promise.all([
          this.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          this.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          this.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        this.isLoaded = true;
      } catch (error) {
        console.error('Failed to load face-api models', error);
        throw error;
      }
    })();

    return this.loadPromise;
  }

  private descriptorCache = new Map<string, Float32Array | null>();

  public async getFaceDescriptor(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, 
    minConfidence: number = 0.2
  ): Promise<Float32Array | null> {
    await this.loadModels();
    if (!this.faceapi) return null;

    try {
      // Lower minConfidence to 0.2 (default is 0.5) to better detect faces on ID cards
      const options = new this.faceapi.SsdMobilenetv1Options({ minConfidence });
      
      const detection = await this.faceapi.detectSingleFace(imageElement, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return null;
      return detection.descriptor;
    } catch (error: any) {
      console.error('Face descriptor extraction failed:', error);
      
      // If WebGL shader linking fails, attempt fallback to CPU backend
      if (
        error?.message?.includes('shader') ||
        error?.message?.includes('WebGL') ||
        error?.message?.includes('link')
      ) {
        try {
          console.warn('[FaceMatcher] WebGL shader linking failed. Falling back to CPU backend...');
          if (this.faceapi?.tf) {
            await this.faceapi.tf.setBackend('cpu');
            const options = new this.faceapi.SsdMobilenetv1Options({ minConfidence });
            const detection = await this.faceapi.detectSingleFace(imageElement, options)
              .withFaceLandmarks()
              .withFaceDescriptor();
            if (!detection) return null;
            return detection.descriptor;
          }
        } catch (cpuError) {
          console.error('[FaceMatcher] CPU fallback face descriptor extraction failed:', cpuError);
        }
      }
      return null;
    }
  }

  /**
   * Retrieves face descriptor with automatic in-memory caching keyed by cacheKey.
   * If the cacheKey was processed before, returns cached Float32Array in 0ms.
   */
  public async getFaceDescriptorCached(
    cacheKey: string,
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    minConfidence: number = 0.2
  ): Promise<Float32Array | null> {
    if (this.descriptorCache.has(cacheKey)) {
      return this.descriptorCache.get(cacheKey) || null;
    }
    const descriptor = await this.getFaceDescriptor(imageElement, minConfidence);
    this.descriptorCache.set(cacheKey, descriptor);
    return descriptor;
  }

  /**
   * Compares two face descriptors and returns the distance.
   * Lower distance means higher similarity.
   * Standard threshold is 0.6 (distance < 0.6 means same person).
   */
  public getFaceDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
    if (!this.faceapi) return 1.0;
    return this.faceapi.euclideanDistance(descriptor1, descriptor2);
  }
}

export const faceMatcher = new FaceMatcherEngine();
