import Agenda from 'agenda';
import DefineJobs, { CRON_JOBS } from './jobs';
const agenda = new Agenda({
  db: {
    address: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`,
    options: { authSource: 'admin' },
    collection: 'agendaJobs',
  },
});
const start = async () => {
  if (process.env.NODE_ENV === 'dev') return;
  DefineJobs(agenda);
  await agenda.start();
  await agenda.every('*/15 * * * *', CRON_JOBS.queryApartmentsToCompute);
  await agenda.every('1 hour', CRON_JOBS.checkFailedAptNotification);
};

export default start;
export { CRON_JOBS, agenda };
