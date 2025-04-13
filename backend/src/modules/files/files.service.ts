import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
  private readonly maxImageSize = 5 * 1024 * 1024; // 5MB for images
  private readonly maxVideoSize = 75 * 1024 * 1024; // 75MB for videos
  private readonly maxVideoDuration = 16; // seconds

  constructor(private configService: ConfigService) {
    // Store uploads in a directory relative to the backend folder
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    // Remove any path traversal attempts
    const sanitized = path.basename(filename);
    // Replace any non-alphanumeric characters (except . and -) with _
    return sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  private validateFileExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.allowedExtensions.includes(ext);
  }

  private async getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }

  private async validateVideoDuration(filePath: string): Promise<boolean> {
    try {
      const duration = await this.getVideoDuration(filePath);
      return duration <= this.maxVideoDuration;
    } catch (error) {
      return false;
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const isVideo = path.extname(file.originalname).toLowerCase() === '.mp4';
    const maxSize = isVideo ? this.maxVideoSize : this.maxImageSize;

    // Validate file size based on file type
    if (file.size > maxSize) {
      throw new BadRequestException(
        isVideo 
          ? 'Video size exceeds 75MB limit'
          : 'Image size exceeds 5MB limit'
      );
    }

    // Validate file extension
    if (!this.validateFileExtension(file.originalname)) {
      throw new BadRequestException('Invalid file type. Only images (jpg, jpeg, png, gif) and videos (mp4) are allowed');
    }

    // Generate secure filename
    const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const filename = `${uniqueSuffix}-${sanitizedOriginalName}`;
    const filePath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // If it's a video, validate duration
    if (isVideo) {
      const isValidDuration = await this.validateVideoDuration(filePath);
      if (!isValidDuration) {
        // Clean up the file
        fs.unlinkSync(filePath);
        throw new BadRequestException(`Video duration exceeds ${this.maxVideoDuration} seconds limit`);
      }
    }

    return {
      path: filePath,
      filename: filename,
      originalName: sanitizedOriginalName,
    };
  }

  async getFile(filename: string): Promise<string | null> {
    // Prevent path traversal
    const sanitizedFilename = this.sanitizeFilename(filename);
    const filePath = path.join(this.uploadDir, sanitizedFilename);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
} 