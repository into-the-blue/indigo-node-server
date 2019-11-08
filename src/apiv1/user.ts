import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from 'routing-controllers';
import { getMongoManager, getMongoRepository } from 'typeorm';
import { Line } from '../db/entities';

@JsonController()
export default class UserController {
  @Get('/')
  getAll = async () => {
    const res = await getMongoRepository(Line).find({});
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
