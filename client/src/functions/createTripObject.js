class Trip {
	constructor(id, clientId, startTime, endTime, pickAddr, destAddr, pickAddrStr, destAddrStr, possibleDrivers, assignedDriver) {
		this.id = id;
		this.clientId = clientId;
		this.startTime = new Date(startTime);
		this.endTime = new Date(endTime);
		this.date = new Date(startTime);
    let diff = (this.endTime.getTime() - this.startTime.getTime()) / 1000;
    diff /= 60;
    this.durationMinute = Math.abs(Math.round(diff)); 

		this.startTimeString = startTime;
		this.endTimeString = endTime;
		this.dateString = this.startTime.toISOString().substring(0, 10);

		this.pickupAddress = pickAddr;
		this.destinationAddress = destAddr;
		this.pickupAddressStr = pickAddrStr;
		this.destinationAddressStr = destAddrStr;
		this.possibleDrivers = possibleDrivers;
		this.assignedDriver = assignedDriver;

		this.shouldFlag = false;
	}
}

export const createTripObject = ({ trip }) => {
  return new Trip(
    trip.id,
    trip.client_id,
    trip.ride_start,
    trip.ride_end,
    trip.pickup_address,
    trip.destination_address,
    trip.pickup_address_str,
    trip.destination_address_str,
    trip.possible_drivers,
    trip.assigned_driver
  );
}