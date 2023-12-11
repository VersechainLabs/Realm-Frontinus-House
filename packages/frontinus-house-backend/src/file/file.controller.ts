import { verifyMessage } from '@ethersproject/wallet';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { File } from './file.entity';
import { FileService } from './file.service';
import { FileUploadDto } from './file.types';
import * as mime from 'mime-types';
import { fromBuffer } from 'file-type';
import { Throttle } from '@nestjs/throttler';
import { S3Service } from './s3.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly s3Service: S3Service,
    ) {}

  @Get()
  async getFiles() {
    return this.fileService.findAll();
  }

  @Get('/:address')
  async getFilesByAddress(@Param('address') address: string) {
    return this.fileService.findAllByAddress(address);
  }

  /**
   * Attempt to fetch a file from local storage based
   * on its hash (filename). This function reads directly
   * from disk and does not require that a file record exist
   * in the database for the provided file.
   */
  @Get('/local/hash/:ipfsHash')
  async getLocal(@Param('ipfsHash') ipfsHash: string, @Res() res: Response) {
    const fileBuf = await this.fileService.readFileFromDisk(ipfsHash);
    const type = await fromBuffer(fileBuf);
    if (type) {
      res.header('Content-Type', mime.contentType(type.mime));
    } else {
      const fileRecords = await this.fileService.findByHash(ipfsHash);
      if (fileRecords.length) {
        res.header('Content-Type', fileRecords[0].mimeType);
      }
    }
    res.send(fileBuf);
  }

  /**
   * Attempt to fetch a file from local storage based
   * on its File ID. This function queries the database
   * to find information about the file and thus requires
   * that the File record exist.
   */
  @Get('/local/id/:id')
  async getById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const file = await this.fileService.findOne(id);
    const fileBuf = await this.fileService.readFileFromDisk(file.ipfsHash);
    res.header('Content-Type', mime.contentType(file.mimeType));
    res.send(fileBuf);
  }

  /**
   * Attempt to upload and pin a file. Files can be optionally
   * signed to prevent them being pruned in the future. (If
   * abuse occurs, unsigned files are likely the first to go)
   */
  @Post()
  @Throttle(5, 300)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() dto: FileUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let address = undefined;
    if (dto.signature) address = verifyMessage(file.buffer, dto.signature);

    const newFileName = uuidv4()+'.jpg';
    const s3Result = await this.s3Service.uploadFile(file, newFileName);
    const fileEntity = new File();
    fileEntity.name = dto.name;
    fileEntity.address = address;
    fileEntity.ipfsHash = newFileName;
    fileEntity.ipfsTimestamp = new Date().toString();
    fileEntity.pinSize = 0; // can be used to seperate ifps/s3 in DB
    fileEntity.mimeType = file.mimetype;
    return this.fileService.store(fileEntity);
  }
  // @Post()
  // @Throttle(5, 300)
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(
  //   @Body() body: FileUploadDto,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   let address = undefined;
  //   if (body.signature) address = verifyMessage(file.buffer, body.signature);
  //   const ipfsResult = await this.fileService.pinBuffer(file.buffer, body.name);
  //   await this.fileService.writeFileToDisk(file.buffer, ipfsResult.IpfsHash);
  //   const fileEntity = new File();
  //   fileEntity.name = body.name;
  //   fileEntity.address = address;
  //   fileEntity.ipfsHash = ipfsResult.IpfsHash;
  //   fileEntity.ipfsTimestamp = ipfsResult.Timestamp;
  //   fileEntity.pinSize = ipfsResult.PinSize;
  //   fileEntity.mimeType = file.mimetype;
  //   return this.fileService.store(fileEntity);
  // }

}
