import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { Response } from 'express';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadFile(file);
    return {
      filename: file.originalname,
      path: result.path,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.filesService.getFile(filename);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    res.sendFile(file);
  }
} 