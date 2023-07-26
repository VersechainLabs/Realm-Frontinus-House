import { Injectable, PipeTransform } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

@Injectable()
export class ParseBooleanPipe extends ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    // 自定义布尔值处理逻辑
    if (metadata.metatype === Boolean) {
      if (typeof value === 'boolean') {
        return value;
      }
      if (value === 'true') return true;

      try {
        return Number.parseInt(value) > 0;
      } catch (e) {
        return false;
      }
    }

    // 再调用 Nest.js 默认的参数转换逻辑
    return super.transform(value, metadata);
  }
}
