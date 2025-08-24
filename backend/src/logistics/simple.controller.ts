import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('logistics/simple')
export class SimpleController {
  @Get()
  @Public()
  test() {
    return { message: 'Simple controller works!', timestamp: new Date() };
  }
  
  @Get('store-selector/familymart')
  @Public()
  familymartTest() {
    return { message: 'FamilyMart route works!', timestamp: new Date() };
  }
}