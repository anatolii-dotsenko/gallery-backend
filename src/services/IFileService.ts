export interface IFileService {
  readImage(type: string, filename: string): Buffer;
  listImages(type: string): string[];
}
export const FILE_SERVICE = "IFileService";