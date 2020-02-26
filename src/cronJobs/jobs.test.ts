require('module-alias/register')
import Path, { format } from 'path'
require('dotenv').config({ path: Path.join(__dirname, '../../.env') })
import Agenda from 'agenda'
import DefineJobs, { CRON_JOBS } from './jobs'
import { Mongo } from '@/db'

const start = async () => {
  await Mongo.connect()
    const agenda = new Agenda({
      db: {
        address: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`,
        options: { authSource: 'admin' },
        collection: 'agendaJobs',
      },
    })

  DefineJobs(agenda)
    await agenda.start()
    await agenda.every('*/1 * * * *', CRON_JOBS.queryApartmentsToCompute)
}
start()
