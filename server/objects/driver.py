import csv
from datetime import datetime

from server.data.address_store import AddressStore
from server.maps_api import get_coordinates, google_api_key
from server.objects.person import Person
from server.objects.rides import Ride


class Driver(Person):

    def __init__(self, first_name: str, last_name: str, phone: str, cell_phone: str, address: tuple, address_str: str,
                 town: str, license_expiry: str) -> None:
        """
        Initializes a driver object, does not do any error checking, the calling function will
        be responsible for ensuring the values passed in are correct.
        """
        super().__init__(first_name, last_name, phone)
        self.cell_phone = cell_phone
        self.address = address
        self.address_str = address_str
        self.town = town
        if isinstance(license_expiry, datetime):
            self.license_expiry = license_expiry
        else:
            try:
                self.license_expiry = datetime.strptime(license_expiry, '%d-%m-%y').strftime('%d/%m/%Y')
            except ValueError:
                self.license_expiry = datetime.strptime(license_expiry, '%d/%m/%Y').strftime('%d/%m/%Y')

        self.unavailable_timings = []

        self.id = f'{first_name}{last_name}{phone}{address_str}{license_expiry}'

    def __repr__(self) -> str:
        """
        Returns the string representation of this Driver object.
        """
        return f'Driver({self.first_name}, {self.last_name}, {self.phone}, {self.address})'

    def get_conflicting_rides(self, ride: Ride) -> list:
        """
        Returns a list of rides that the incoming ride has a conflict with.
        Returns the empty list if no conflicts are found.
        """
        min_time_between_rides = 0
        conflicts = []
        ride_start, ride_end = ride.ride_start, ride.ride_end
        for start, end, ride_id in self.unavailable_timings:
            if ride_start > end and (ride_start - end).total_seconds() < min_time_between_rides:
                conflicts.append(ride_id)
            if ride_end < start and (start - ride_end).total_seconds() < min_time_between_rides:
                conflicts.append(ride_id)
            if start <= ride_start <= end or start <= ride_end <= end:
                conflicts.append(ride_id)
            if ride_start <= start and ride_end >= end:
                conflicts.append(ride_id)
        return conflicts

    def add_accepted_ride(self, ride: Ride) -> bool:
        """
        Adds an accepted ride to the driver, and returns whether it was successful.
        """
        if not self.get_conflicting_rides(ride):
            self.unavailable_timings.append((ride.ride_start, ride.ride_end, ride.id))
            return True
        return False


def generate_driver(attributes: list, cache: AddressStore = None) -> Driver:
    """
    Takes in a list of strings in the following format:
    [First Name,Last Name,Phone,Cell Phone,Town/City,Address,DOB,License Expiry,Insurance Expiry,Comment]

    The format must not deviate from this, as the indexes are hardcoded.
    """
    indexes = [0, 1, 2, 3, 4, 5, 7]
    fname, lname, phone, cell_phone, town, address_str, license_expiry = [attributes[i] for i in indexes]

    if cache:
        address = cache.get_coord(address_str)
    else:
        address = get_coordinates(address_str, google_api_key)
    return Driver(fname, lname, phone, cell_phone, address, address_str, town, license_expiry)


def get_drivers_list(filepath: str) -> list:
    """
    Returns a list of Driver objects given a filepath to a drivers csv.
    """
    store = AddressStore()
    drivers = []
    with open(filepath, 'r', newline='') as f:
        # skip header
        next(f)
        reader = csv.reader(f)
        for line in reader:
            drivers.append(generate_driver(line, store))
            print(f'Drivers parsed: {len(drivers)}')
    return drivers


if __name__ == '__main__':
    print(get_drivers_list('../data/drivers.csv'))
