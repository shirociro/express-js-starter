import { getMetaDataService } from '../services/metaService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getMetaData = asyncHandler(async (req, res) => {
  const data = await getMetaDataService()
  return res.status(200).json({
    success: true,
    data,
    meta: {
      usersCount: data.users.length,
      positionsCount: data.positions.length,
      rolesCount: data.roles.length,
    },
  })
})
