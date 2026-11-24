import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { attachContext, type AppEnv } from './middleware/auth'
import { errorHandler, notFoundHandler } from './middleware/error'
import { health } from './routes/health'
import { me } from './routes/me'
import { publicRoutes } from './routes/public'
import { cart } from './routes/cart'
import { orders } from './routes/orders'
import { farmer } from './routes/farmer'
import { volunteer } from './routes/volunteer'
import { coordinator } from './routes/coordinator'
import { admin } from './routes/admin'

export const app = new Hono<AppEnv>()

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = (c.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
      if (allowed.includes('*')) return origin || '*'
      if (origin && allowed.includes(origin)) return origin
      return origin && allowed.length === 0 ? origin : ''
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
  }),
)

app.use('*', attachContext)

app.route('/v1/health', health)
app.route('/v1/me', me)
app.route('/v1', publicRoutes)
app.route('/v1/cart', cart)
app.route('/v1/orders', orders)
app.route('/v1/farmer', farmer)
app.route('/v1/volunteer', volunteer)
app.route('/v1/coordinator', coordinator)
app.route('/v1/admin', admin)

app.onError(errorHandler)
app.notFound(notFoundHandler)
