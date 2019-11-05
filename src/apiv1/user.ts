import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from 'routing-controllers';

@JsonController()
export default class UserController {
  @Get('/')
  getAll(): any[] {
    return [];
  }

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return 'hello';
  }

  @Post('/users')
  post(@Body() user: any) {
    return 'success';
  }
}
