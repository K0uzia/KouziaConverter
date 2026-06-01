export type MediaKind = 'image' | 'video' | 'icon';

export type OutputFormatId =
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'svg'
  | 'mp4'
  | 'webm'
  | 'mov'
  | 'mkv'
  | 'avi'
  | 'ico'
  | 'icns'
  | 'png-icon';

export type JobStatus = 'idle' | 'ready' | 'queued' | 'unsupported';

export interface OutputFormat {
  id: OutputFormatId;
  label: string;
  kind: MediaKind;
  extension: string;
  description?: string;
}

export interface Preset {
  id: string;
  label: string;
  formatId: OutputFormatId;
  description: string;
}

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  kind: MediaKind | 'unknown';
  status: JobStatus;
}

export interface ConversionJob {
  fileId: string;
  presetId: string;
  status: JobStatus;
}
