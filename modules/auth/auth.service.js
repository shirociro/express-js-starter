export function createAuthService({ bcrypt, jwt, authModel, config }) {
  const {
    JWT_SECRET,
    REFRESH_SECRET,
    ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN,
    REFRESH_DB_EXPIRES_MS,
  } = config

  async function login({ username, password }) {
    if (!username || !password) {
      return { ok: false, status: 400, message: 'Missing username or password' }
    }

    const user = await authModel.findByUsername(username)
    if (!user) return { ok: false, status: 401, message: 'Invalid credentials' }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return { ok: false, status: 401, message: 'Invalid credentials' }

    const accessToken = jwt.sign(
      {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        role_id: user.role_id,
        position: user.position,
        profile: user.profile,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    )

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    })
    const expiresAt = new Date(Date.now() + REFRESH_DB_EXPIRES_MS)

    await authModel.insertRefreshToken(user.id, refreshToken, expiresAt)
    await authModel.logAction(user.id, 'User logged in')

    return {
      ok: true,
      status: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          role_id: user.role_id,
          position: user.position,
          profile: user.profile,
        },
      },
    }
  }

  async function register({ username, password, firstname, lastname }) {
    if (!username || !password || !firstname || !lastname) {
      return { ok: false, status: 400, message: 'Missing required fields' }
    }

    const existing = await authModel.findByUsername(username)
    if (existing) return { ok: false, status: 400, message: 'Username already taken' }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = await authModel.insertUser({ username, hashedPassword, firstname, lastname })

    const accessToken = jwt.sign({ id: userId, firstname, lastname, username }, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    })
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
    const expiresAt = new Date(Date.now() + REFRESH_DB_EXPIRES_MS)

    await authModel.insertRefreshToken(userId, refreshToken, expiresAt)
    await authModel.logAction(userId, 'User registered')

    return {
      ok: true,
      status: 201,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        user: { id: userId, firstname, lastname, username },
      },
    }
  }

  async function listUsers() {
    const users = await authModel.getAllUsers()
    return {
      ok: true,
      status: 200,
      message: 'Users fetched successfully',
      data: users,
    }
  }

  async function refreshToken({ refreshToken }) {
    if (!refreshToken) {
      return { ok: false, status: 400, message: 'Missing refresh token' }
    }

    // Find the token in DB
    const tokenRecord = await authModel.findRefreshToken(refreshToken)
    if (!tokenRecord) {
      return { ok: false, status: 401, message: 'Invalid or expired refresh token' }
    }

    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET)
      const user = await authModel.findById(payload.id)
      if (!user) return { ok: false, status: 404, message: 'User not found' }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          role_id: user.role_id,
          position: user.position,
          profile: user.profile,
        },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
      )

      return {
        ok: true,
        status: 200,
        message: 'Access token refreshed',
        data: { accessToken },
      }
    } catch (err) {
      return { ok: false, status: 401, message: 'Invalid or expired refresh token' }
    }
  }

  return { login, register, listUsers, refreshToken }
}
