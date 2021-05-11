from __future__ import annotations

import csv
import re
from datetime import datetime

from server.data.address_store import AddressStore
from server.maps_api import get_coordinates, google_api_key


class Ride:
    """
    A class that represents a ride object and it's associated attributes.
    """

    def __init__(self, client_id: str, ride_start: datetime, ride_end: datetime,
                 pickup_address: tuple, destination_address: tuple, pickup_address_str: str,
                 destination_address_str: str) -> None:
        """
        Initializes a ride object, does not do any error checking, the calling function will
        be responsible for ensuring the values passed in are correct.
        """
        self.id = f'{client_id}{ride_start}{ride_end}{pickup_address_str}{destination_address_str}'
        self.client_id = client_id
        self.ride_start = ride_start
        self.ride_end = ride_end
        self.pickup_address = pickup_address
        self.destination_address = destination_address
        self.pickup_address_str = pickup_address_str
        self.destination_address_str = destination_address_str

        self.assigned_driver = None
        self.possible_drivers = []

    def __repr__(self) -> str:
        """
        Returns the string representation of this Ride object.
        """
        return f'Ride({self.client_id}, {self.ride_start}, {self.ride_end},' \
               f'{self.pickup_address}, {self.destination_address})'

    def assign_driver(self, driver) -> None:
        """
        Assigns a driver to this ride.
        """
        self.assigned_driver = driver
        self.possible_drivers.clear()


def find_date(filename: str) -> str:
    """
    Returns the date from a string.
    """
    timestamp = re.search(r'\d{4}-\d{2}-\d{2}', filename)
    if timestamp is None:
        raise ValueError('find_date: Date not found in input.')
    else:
        return timestamp.group()


def find_time(filename: str) -> str:
    """
    Returns the time from a string.
    """
    timestamp = re.search(r'\d{2}:\d{2} (am|pm)', filename)
    if timestamp is None:
        raise ValueError('find_time: Time not found in input.')
    else:
        return timestamp.group()


def convert_to_datetime(date: str, time: str) -> datetime:
    """
    Converts a date and time string into a datetime object.
    """
    return datetime.strptime(date + time, '%Y-%m-%d%I:%M %p')


def generate_ride(attributes: list, cache: AddressStore = None) -> Ride:
    """
    Takes in a list of strings in the following format:
    [ClientID, Ride Date, Appointment Time, End Time, Wait Time, Pickup Address, Dest Address]

    The format must not deviate from this, as the indexes are hardcoded.
    """
    indexes = [0, 1, 2, 3, 5, 6]
    client_id, date, start, end, pickup_str, dest_str = [attributes[i] for i in indexes]
    # print(client_id, date, start, end, pickup, dest)
    date = find_date(date)
    start = find_time(start)
    end = find_time(end)
    start = convert_to_datetime(date, start)
    end = convert_to_datetime(date, end)
    if cache:
        pickup = cache.get_coord(pickup_str)
        dest = cache.get_coord(dest_str)
    else:
        pickup = get_coordinates(pickup_str, google_api_key)
        dest = get_coordinates(dest_str, google_api_key)
    return Ride(client_id, start, end, pickup, dest, pickup_str, dest_str)


def get_rides_list(filepath: str) -> list:
    """
    Returns a list of Ride objects given a filepath to a rides csv.
    """
    store = AddressStore()
    rides = []
    with open(filepath, 'r', newline='') as f:
        # skip header
        next(f)
        reader = csv.reader(f)
        for line in reader:
            rides.append(generate_ride(line, store))
            print(f'Rides parsed: {len(rides)}')
    return rides


if __name__ == '__main__':
    print(get_rides_list('../data/rides_short.csv'))
