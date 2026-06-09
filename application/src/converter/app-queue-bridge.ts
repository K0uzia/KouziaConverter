import { createDesktopFileStub, getDesktopFilePath } from './app-desktop-file.ts';

export interface DesktopRestoredFileMeta {
  path: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export const desktopQueueBridge = {
  getSourcePath(file: File): string | undefined {
    return getDesktopFilePath(file);
  },

  restoreDesktopFile(meta: DesktopRestoredFileMeta): File {
    return createDesktopFileStub({
      path: meta.path,
      name: meta.name,
      mime: meta.type,
      size: meta.size,
    });
  },
};
