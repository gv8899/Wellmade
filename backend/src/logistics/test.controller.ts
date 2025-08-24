import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/logistics/test')
export class TestController {
  @Get()
  @Public()
  test() {
    return { message: 'Logistics module is working!' };
  }
}