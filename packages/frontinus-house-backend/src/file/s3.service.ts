import { Injectable, Req, Res } from '@nestjs/common';
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service
{
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3
  ({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  async uploadFile(file: Express.Multer.File, newFileName: string)
  {
    // const { originalname } = file;

    await this.s3_upload(file.buffer, this.AWS_S3_BUCKET, newFileName, file.mimetype);
  }

  async s3_upload(file, bucket, newFileName: string, mimetype)
  {
    const params = 
    {
      Bucket: bucket,
      Key: newFileName,
      // Key: 'chao.jpg',
      Body: file,
      ACL: "public-read",
      ContentType: mimetype,
      ContentDisposition:"inline",
      CreateBucketConfiguration: 
      {
          LocationConstraint: "ap-south-1"
      }
    };

    // Sample:
    // {
    //   Bucket: 'cdn.metaforo.io',
    //   Key: 'cc2.png',
    //   Body: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 9a 00 00 00 60 08 02 00 00 00 6a 94 fc 3f 00 00 0c 62 69 43 43 50 49 43 43 20 50 72 6f 66 69 ... 4828 more bytes>,
    //   ACL: 'public-read',
    //   ContentType: 'image/png',
    //   ContentDisposition: 'inline',
    //   CreateBucketConfiguration: { LocationConstraint: 'ap-south-1' }
    // }
    console.log(params);

    try
    {
      let s3Response = await this.s3.upload(params).promise();

      // Sample:
      // {
      //   ETag: '"abe11912cbdc8c2f7b5867d957545768"',
      //   ServerSideEncryption: 'AES256',
      //   Location: 'https://s3.amazonaws.com/cdn.metaforo.io/cc2.png',
      //   key: 'cc2.png',
      //   Key: 'cc2.png',
      //   Bucket: 'cdn.metaforo.io'
      // }
      console.log(s3Response);

      return s3Response;
    }
    catch (e)
    {
      console.log(e);
    }
  }
}
