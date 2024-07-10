import { rest } from 'msw'
import { faker } from 'faker'

export const handlers = [
  rest.get('/api/bookings', (req, res, ctx) => {
    // Имитация получения бронирований
    const bookings = Array.from({ length: 3 }, () => ({
      id: faker.datatype.uuid(),
      movieId: faker.datatype.uuid(),
      movieTitle: faker.commerce.productName(),
      time: faker.date.future().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seats: Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => ({
        row: faker.datatype.number({ min: 1, max: 10 }),
        number: faker.datatype.number({ min: 1, max: 20 }),
      })),
    }))

    return res(ctx.status(200), ctx.json(bookings))
  }),

  rest.post('/api/bookings/cancel', (req, res, ctx) => {
    // Имитация отмены бронирования
    return res(ctx.status(200), ctx.json({ message: 'Бронирование успешно отменено' }))
  }),

  rest.post('/api/bookings/change', (req, res, ctx) => {
    // Имитация изменения бронирования
    const { bookingId, movieId, time, seats } = req.body as any
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Бронирование успешно изменено',
        booking: {
          id: bookingId,
          movieId,
          time,
          seats,
          movieTitle: faker.commerce.productName(),
        },
      })
    )
  }),
]