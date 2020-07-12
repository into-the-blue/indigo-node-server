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
import { get } from 'lodash';

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
        const res = await Mongo.DAO.Task.aggregate([
          {
            $match: {
              status: 'idle',
            },
          },
          {
            $count: 'count',
          },
        ]).toArray();
        return get(res, '[0].count', 0);
      };
      const queryCompletedTasksInLastHour = async () => {
        const res = await Mongo.DAO.Task.aggregate([
          {
            $match: {
              status: 'done',
              updated_at: {
                $gte: moment().add(-1, 'hour').toDate(),
              },
            },
          },
          {
            $count: 'count',
          },
        ]).toArray();
        return get(res, '[0].count', 0);
      };

      const queryNewApartments = async () => {
        const res = await Mongo.DAO.Apartment.aggregate([
          {
            $match: {
              updated_time: {
                $gte: moment().add(-1, 'hour').toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ]).toArray();
        return get(res, '[0].count', 0);
      };

      const queryNewTasksInLast6h = async () => {
        const res = await Mongo.DAO.Task.aggregate([
          {
            $match: {
              created_at: {
                $gte: moment().add(-6, 'hour').toDate(),
              },
            },
          },
          {
            $count: 'count',
          },
        ]).toArray();
        return get(res, '[0].count', 0);
      };

      return forkJoin({
        newUsers: queryNewUser(),
        numOfIdleTasks: queryIdleTasks(),
        numOfCompletedTasksInLastHour: queryCompletedTasksInLastHour(),
        numOfNewApartmentsInLastHour: queryNewApartments(),
        numOfNewTasksInLast6Hour: queryNewTasksInLast6h(),
      }).toPromise();
    };

    const status = await getCached(
      CACHE_KEYS['api/universal/status'],
      appStatus,
      900
    );
    return response(RESP_CODES.OK, undefined, status);
  }
}
