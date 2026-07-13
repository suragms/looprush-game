/**
 * Captures the last N seconds of gameplay via canvas.captureStream() + MediaRecorder.
 * Maintains a circular buffer of chunks; on stop(), returns the final clip as a Blob.
 *
 * Degrades gracefully when MediaRecorder is unavailable (returns null from stop()).
 */

const MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const mime of MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

export interface HighlightRecorderOptions {
  /** Duration in seconds to keep in the circular buffer. Default 5. */
  duration?: number;
  /** Frame rate for captureStream. Default 30. */
  fps?: number;
  /** VideoBitsPerSecond for MediaRecorder. Lower = smaller file. Default 2_500_000 (2.5 Mbps). */
  videoBitsPerSecond?: number;
}

export class HighlightRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private chunkTimestamps: number[] = [];
  private startTime = 0;
  private duration: number;
  private fps: number;
  private videoBitsPerSecond: number;
  private mimeType: string | null = null;

  /** True while recording is active. */
  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  constructor(opts?: HighlightRecorderOptions) {
    this.duration = opts?.duration ?? 5;
    this.fps = opts?.fps ?? 30;
    this.videoBitsPerSecond = opts?.videoBitsPerSecond ?? 2_500_000;
  }

  /**
   * Start recording from the given canvas element.
   * Returns false if MediaRecorder is not supported.
   */
  start(canvas: HTMLCanvasElement): boolean {
    this.mimeType = pickMimeType();
    if (!this.mimeType) return false;

    const stream = canvas.captureStream(this.fps);
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: this.videoBitsPerSecond,
    });

    this.chunks = [];
    this.chunkTimestamps = [];
    this.startTime = Date.now();

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
        this.chunkTimestamps.push(Date.now());
        this.pruneOldChunks();
      }
    };

    // Use a small timeslice so we get frequent chunks for the circular buffer
    this.mediaRecorder.start(200);
    return true;
  }

  /**
   * Stop recording and return the last `duration` seconds as a single Blob.
   * Returns null if nothing was recorded.
   */
  async stop(): Promise<Blob | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null;
    }

    return new Promise<Blob | null>((resolve) => {
      const recorder = this.mediaRecorder!;
      recorder.onstop = () => {
        const blob = this.extractLastDuration();
        this.mediaRecorder = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }

  /** Discard chunks older than the configured duration window. */
  private pruneOldChunks(): void {
    const cutoff = Date.now() - this.duration * 1000;
    while (this.chunkTimestamps.length > 0 && this.chunkTimestamps[0]! < cutoff) {
      this.chunks.shift();
      this.chunkTimestamps.shift();
    }
  }

  /** Build a single Blob from the chunks in the current buffer window. */
  private extractLastDuration(): Blob | null {
    this.pruneOldChunks();
    if (this.chunks.length === 0) return null;
    return new Blob(this.chunks, { type: this.mimeType ?? 'video/webm' });
  }

  /** Force-clear buffer without stopping (e.g. on game restart). */
  reset(): void {
    this.chunks = [];
    this.chunkTimestamps = [];
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
  }
}
