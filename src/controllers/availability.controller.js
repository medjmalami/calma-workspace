const availabilityService = require('../services/availability.service');

async function searchAvailability(request, response, next) {
  try {
    const availability = await availabilityService.searchAvailableRooms(request.query);
    response.status(200).json({ availability });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchAvailability,
};
