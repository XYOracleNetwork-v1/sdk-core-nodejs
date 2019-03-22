import express, { Express } from 'express'
import path from 'path'

const staticDir = path.resolve(process.cwd(), process.env.STATIC || '')
export const applyRoutes = (app: Express) => {
  app.use(express.static(staticDir))
}
