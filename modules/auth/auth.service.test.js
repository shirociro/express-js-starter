import { createAuthService } from './auth.service.js'
import { jest } from '@jest/globals' // <-- add this at the to
const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
}

const mockJwt = {
  sign: jest.fn(),
}

const mockAuthModel = {
  findByUsername: jest.fn(),
  insertUser: jest.fn(),
  insertRefreshToken: jest.fn(),
  logAction: jest.fn(),
  getAllUsers: jest.fn(),
}

const config = {
  JWT_SECRET: 'test_jwt_secret',
  REFRESH_SECRET: 'test_refresh_secret',
  ACCESS_EXPIRES_IN: '1h',
  REFRESH_EXPIRES_IN: '7d',
  REFRESH_DB_EXPIRES_MS: 3600000,
}

const authService = createAuthService({
  bcrypt: mockBcrypt,
  jwt: mockJwt,
  authModel: mockAuthModel,
  config,
})

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login returns error if username is missing', async () => {
    const result = await authService.login({ password: '123' })
    expect(result.ok).toBe(false)
    expect(result.status).toBe(400)
  })

  test('login returns error if user not found', async () => {
    mockAuthModel.findByUsername.mockResolvedValue(null)
    const result = await authService.login({ username: 'test', password: '123' })
    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
  })

  test('login returns access and refresh tokens on success', async () => {
    const user = { id: 1, password: 'hashed', firstname: 'John', lastname: 'Doe', username: 'john' }
    mockAuthModel.findByUsername.mockResolvedValue(user)
    mockBcrypt.compare.mockResolvedValue(true)
    mockJwt.sign.mockReturnValue('fakeToken')

    const result = await authService.login({ username: 'john', password: '123' })
    expect(result.ok).toBe(true)
    expect(result.data.accessToken).toBe('fakeToken')
    expect(result.data.refreshToken).toBe('fakeToken')
  })
})
