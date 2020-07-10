import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
  Authorized,
  NotFoundError,
} from 'routing-controllers';
import { response, RESP_CODES } from '@/utils';
import { Mongo, getCached, CACHE_KEYS } from '@/db';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@JsonController()
export class UniversalController {
  @Get('/universal/banners')
  getBanners() {
    return response(RESP_CODES.OK, undefined, [
      {
        imgUrl:
          'https://indigo.oss-cn-hangzhou.aliyuncs.com/banners/20-06-06.png',
        type: 'free_membership',
        width: 750,
        height: 225,
      },
    ]);
  }

  @Get('/universal/status')
  async getAppStatus() {
    const appStatus = async () => {
      const queryNewUser = async () => {
        return (
          await Mongo.DAO.User.find({
            where: {
              created_at: {
                $gte: new Date(moment().format('YYYY-MM-DD')),
              },
            },
          })
        ).length;
      };

      const queryIdleTasks = async () => {
        return (
          await Mongo.DAO.Task.find({
            where: {
              status: 'idle',
            },
          })
        ).length;
      };
      const queryCompletedTasksInLastHour = async () => {
        return (
          await Mongo.DAO.Task.find({
            where: {
              status: 'done',
              updated_at: {
                gte: moment().add(-1, 'hour').toDate(),
              },
            },
          })
        ).length;
      };

      const queryNewApartments = async () => {
        return (
          await Mongo.DAO.Apartment.find({
            where: {
              updated_time: {
                gte: moment().add(-1, 'hour').toDate(),
              },
            },
          })
        ).length;
      };

      return forkJoin(
        queryNewUser(),
        queryIdleTasks(),
        queryCompletedTasksInLastHour(),
        queryNewApartments()
      )
        .pipe(
          map(
            ([
              newUsers,
              numOfIdleTasks,
              numOfCompletedTasksInLastHour,
              numOfNewApartmentsInLastHour,
            ]) => ({
              newUsers,
              numOfIdleTasks,
              numOfCompletedTasksInLastHour,
              numOfNewApartmentsInLastHour,
              date: new Date(),
            })
          )
        )
        .toPromise();
    };

    const status = await getCached(
      CACHE_KEYS['api/universal/status'],
      appStatus,
      3600
    );
    return response(RESP_CODES.OK, undefined, status);
  }
}
