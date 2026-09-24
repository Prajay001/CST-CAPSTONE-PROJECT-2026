import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import authRoutes from '../routes/authRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Auth API Endpoints', () => {
  const testEmail = `test${Date.now()}@gmail.com`
  const testPassword = 'P@ssword1'

  it('TC-API-01: registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Jay Patel', email: testEmail, password: testPassword })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('userId')
  })

  it('TC-API-02: rejects duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Jay Patel', email: testEmail, password: testPassword })

    expect(res.status).toBe(409)
  })

  it('TC-API-03: logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('TC-API-04: rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongPassword123!' })

    expect(res.status).toBe(401)
  })

  it('TC-API-05: register rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@gmail.com' })

    expect(res.status).toBe(400)
  })

  it('TC-API-06 (partial): reset endpoint responds without crashing', async () => {
    const res = await request(app)
      .post('/api/auth/reset')
      .send({ email: testEmail })

    expect([200, 400]).toContain(res.status)
  })
})
