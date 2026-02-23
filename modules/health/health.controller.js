export const getHealth = async (req, res) => {
  try {
    res.status(200).json({
      status: 'blehh success',
      timestamp: new Date(),
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    })
  }
}
