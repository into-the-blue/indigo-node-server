import Agenda from 'agenda';
import { Mongo } from '@/db';
import moment from 'moment';
import { from, empty } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { mean } from 'lodash';
import { ApartmentEntity } from '@/db/entities';
import { logger, toCamelCase } from '@/utils';
import { sendWechatMessage } from './helper';
import { SubscriptionModel } from '@/apiv1/subscription/model/subscription';

export const CRON_JOBS = {
  computeApartments: 'computeApartments',
  queryApartmentsToCompute: 'queryApartmentsToCompute',
  sendSubscriptionNotification: 'sendSubscriptionNotification',
  checkFailedAptNotification: 'checkFailedAptNotification',
};

const RANGE = 500;

const median = (arr: number[]): number => {
  const isOdd = arr.length % 2 === 1;
  if (isOdd) return arr[(arr.length + 1) / 2];
  return +((arr[arr.length / 2] + arr[arr.length / 2 + 1]) / 2).toFixed(2);
};

const compute = (apts: ApartmentEntity[], target: ApartmentEntity) => {
  const total = apts.length;
  const prices = apts
    .map((a) => a.price)
    .concat(target.price)
    .sort((a, b) => a - b);
  const PPSM = apts
    .map((a) => a.pricePerSquareMeter)
    .concat(target.pricePerSquareMeter)
    .sort((a, b) => a - b);
  const areas = apts
    .map((a) => a.area)
    .concat(target.area)
    .sort((a, b) => a - b);
  const averagePrice = +mean(prices).toFixed(2);
  const averagePPSM = +mean(PPSM).toFixed(2);
  const averageArea = +mean(areas).toFixed(2);
  const rankingOfPPSM = PPSM.indexOf(target.pricePerSquareMeter);
  const rankingOfPrice = prices.indexOf(target.price);
  const rankingOfArea = areas.indexOf(target.area);

  const medianPPSM = median(PPSM);
  const medianPrice = median(prices);
  const medianArea = median(areas);

  const lowestPPSM = (apts.find((a) => a.pricePerSquareMeter === PPSM[0]) || {})
    .id;
  const lowestPrice = (apts.find((a) => a.price === prices[0]) || {}).id;
  return {
    updatedAt: new Date(),
    averagePrice,
    averagePPSM,
    averageArea,
    medianPPSM,
    medianPrice,
    medianArea,
    rankingOfPPSM,
    rankingOfPrice,
    rankingOfArea,
    lowestPPSM,
    lowestPrice,
    total,
  };
};

const findApartmentsNearby = (coordinates: number[], range: number) =>
  Mongo.DAO.Apartment.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: coordinates },
        distanceField: 'distance',
        minDistance: 0,
        maxDistance: range,
        query: { expired: { $ne: true } },
        key: 'coordinates',
        spherical: true,
      },
    },
    {
      $project: {
        area: 1,
        price_per_square_meter: 1,
        price: 1,
        created_at: 1,
        distance: 1,
      },
    },
  ]).toArray();

const computeSingleApartment = (apartment: ApartmentEntity) =>
  from(findApartmentsNearby(apartment.coordinates, RANGE)).pipe(
    map((apts) => apts.map(toCamelCase)),
    map((apts) => {
      if (!apts.length) return null;
      const res = compute(apts, apartment);
      return {
        ...res,
        range: RANGE,
      };
    }),
    switchMap((computed) =>
      computed
        ? Mongo.DAO.Apartment.updateOne(
            { _id: apartment.id },
            {
              $set: {
                computed,
                updated_at: new Date(),
              },
            }
          )
        : empty()
    )
  );

const findApartmentsToCompute = async (
  limit: number = 1000
): Promise<ApartmentEntity[]> => {
  const match = {
    $match: {
      created_at: {
        $gte: moment().add(-31, 'day').toISOString(),
      },
      coordinates: { $ne: null },
      $and: [
        {
          expired: { $ne: true },
        },
        {
          $or: [
            {
              computed: {
                $exists: false,
              },
            },
            {
              'computed.updated_at': {
                $lte: moment().add(-25, 'hours').toISOString(),
              },
            },
          ],
        },
      ],
    },
  };
  const sort = {
    $sort: {
      updated_time: -1,
    },
  };
  const project = {
    $project: {
      area: 1,
      price_per_square_meter: 1,
      price: 1,
      updated_time: 1,
      coordinates: 1,
      created_at: 1,
    },
  };
  const data = await Mongo.DAO.Apartment.aggregate([
    match,
    sort,
    project,
    { $limit: limit },
  ]).toArray();
  return data.map(toCamelCase);
};

const queryAptsOfFailToSendNoti = async () => {
  return Mongo.DAO.Apartment.find({
    where: {
      notification_sent: false,
    },
  });
};
export default (agenda: Agenda) => {
  agenda.define(CRON_JOBS.sendSubscriptionNotification, async (job, done) => {
    const {
      priority,
      wechat_notify_enable,
      email_notify_enable,
      sms_notify_enable,
      location_id,
      apartment_id,
      subscription_id,
      user_id,
      address,
      price,
      area,
      house_type,
      distance,
    } = job.attrs.data;
    console.warn(CRON_JOBS.sendSubscriptionNotification, new Date());
    const user = await Mongo.DAO.User.findOne(user_id);
    if (!user) return done(new Error('user not exists'));
    const { email, phoneNumber } = user;
    const message = `附近${Math.round(
      +distance
    )}米: ${house_type} ${price}¥ ${area}㎡`;
    if (wechat_notify_enable) {
      logger.info('[sendSubscriptionNotification] [wechat]');
      // send wechat notificaton
      sendWechatMessage(user.authData.openId, message).catch((err) => {
        logger.error('[sendSubscriptionNotification] [wechat] ', err);
      });
    }
    if (email_notify_enable) {
      logger.info('[sendSubscriptionNotification] [email]');
      // send email notification
    }
    if (sms_notify_enable) {
      logger.info('[sendSubscriptionNotification] [sms]');
      // send sms notification
    }

    done();
  });

  agenda.define(CRON_JOBS.computeApartments, (job, done) => {
    const { apartment } = job.attrs.data;
    // logger.info('START JOB ' + CRON_JOBS.computeApartments)
    computeSingleApartment(apartment).subscribe({
      error: (err) => {
        logger.error(err);
        done(err);
      },
      complete: () => {
        // logger.info('DONE ' + CRON_JOBS.computeApartments)
        done();
      },
    });
  });

  agenda.define(CRON_JOBS.queryApartmentsToCompute, (job, done) => {
    logger.info('START JOB ' + CRON_JOBS.queryApartmentsToCompute);
    from(findApartmentsToCompute())
      .pipe(
        switchMap((d) => from(d)),
        mergeMap((apt) =>
          agenda.now(CRON_JOBS.computeApartments, {
            apartment: apt,
          })
        )
      )
      .subscribe({
        error: (err) => {
          logger.error(err);
          done(err);
        },
        complete: () => {
          logger.info('DONE ' + CRON_JOBS.queryApartmentsToCompute);
          done();
        },
      });
  });

  agenda.define(CRON_JOBS.checkFailedAptNotification, (job, done) => {
    from(queryAptsOfFailToSendNoti())
      .pipe(
        switchMap((data) => from(data)),
        mergeMap((apt) => SubscriptionModel.notify(apt.id.toString()))
      )
      .subscribe({
        error: (err) => {
          logger.error(err);
          done(err);
        },
        complete: () => {
          logger.info('DONE ' + CRON_JOBS.checkFailedAptNotification);
          done();
        },
      });
  });
};
