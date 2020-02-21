import { Mongo } from '@/db'
import Agenda from 'agenda'

enum CRON_JOBS {
  computeApartments = 'computeApartments',
}

const agenda = new Agenda({
  db: {
    address: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`,
    options: { authSource: 'admin' },
    collection: 'agendaJobs',
  },
})

agenda.define(CRON_JOBS.computeApartments, json => {
  const apartments = Mongo.DAO.Apartment.find({
    where:{
      $or:[
        
      ]
    }
  })
})

const start = async () => {
  await agenda.start()
  await agenda.schedule('0 2 * * *', CRON_JOBS.computeApartments)
}

export default start
