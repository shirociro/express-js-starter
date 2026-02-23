import { createAuthController } from './auth.controller.js'
import { jest } from '@jest/globals' // <-- add this at the to
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  listUsers: jest.fn(),
}

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const responseUtils = {
  success: (res, data, message, status) => res.status(status).json({ message, data }),
  error: (res, message, errors, status) => res.status(status).json({ message, errors }),
}

const authController = createAuthController(mockAuthService, responseUtils)

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login calls authService and returns success', async () => {
    const req = { body: { username: 'john', password: '123' } }
    const res = mockRes()
    mockAuthService.login.mockResolvedValue({
      ok: true,
      status: 200,
      message: 'ok',
      data: { id: 1 },
    })

    await authController.login(req, res)
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'john', password: '123' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'ok', data: { id: 1 } })
  })
})
