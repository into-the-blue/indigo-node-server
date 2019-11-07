import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from 'routing-controllers';
import { Mongo } from '../config';

@JsonController()
export default class UserController {
  @Get('/')
  getAll = async () => {
    const res = await Mongo.findLines({});
    return res.length;
  };

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return 'hello';
  }

  @Post('/users')
  post(@Body() user: any) {
    return 'success';
  }
}
