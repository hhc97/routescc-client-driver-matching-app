"""
This module holds the class that the backend server can interact with.
"""

from __future__ import annotations

import pickle
from datetime import datetime
from math import ceil
from typing import List

import server.mongo_helpers as db
from server.maps_api import get_distance_between
from server.max_flow import ford_fulkerson
from server.objects.driver import Driver, get_drivers_list
from server.objects.rides import Ride, get_rides_list

COLLECTION_NAME = 'rides_and_drivers'
DRIVERS = 'drivers'
RIDES = 'rides'
REJECTED_MATCHES = 'rejected_pairs'


class MatchMaker:
    """
    A class that provides an API for retrieving matches.
    """

    rides: List[Ride]
    drivers: List[Driver]
    changed: bool
    rejected: set

    def __init__(self) -> None:
        """
        Initializes a new MatchMaker object.
        """
        self.matches = {}
        self.rides = []
        self.drivers = []
        self.unmatched_rides = []
        self.changed = False
        self.rejected = set()

        previous_data = db.get_latest(COLLECTION_NAME)
        if previous_data:
            self.rides = pickle.loads(previous_data[RIDES])
            self.drivers = pickle.loads(previous_data[DRIVERS])
            self.rejected = pickle.loads(previous_data[REJECTED_MATCHES])

    def _commit_changes(self) -> None:
        """
        Commit the current state of matchmaker to the database.
        """
        self.changed = True
        self._remove_old_rides()
        self._make_unique()
        self.match()
        driver_dump = pickle.dumps(self.drivers)
        ride_dump = pickle.dumps(self.rides)
        rejected_dump = pickle.dumps(self.rejected)
        new_data = {DRIVERS: driver_dump,
                    RIDES: ride_dump,
                    REJECTED_MATCHES: rejected_dump}
        db.add_to_db(COLLECTION_NAME, new_data)

    def _make_unique(self) -> None:
        """
        Ensures that rides and drivers are unique.
        """
        # ensure rides and drivers are unique
        new_rides = []
        seen_rides = set()
        for r in self.rides:
            if r.id not in seen_rides:
                new_rides.append(r)
                seen_rides.add(r.id)

        new_drivers = []
        seen_drivers = set()
        for d in self.drivers:
            if d.id not in seen_drivers:
                new_drivers.append(d)
                seen_drivers.add(d.id)
        self.rides = new_rides
        self.drivers = new_drivers
        # remove old entries from rejected list
        current_ride_ids = {r.id for r in self.rides}
        self.rejected = {pair for pair in self.rejected if pair[1] in current_ride_ids}

    def _remove_old_rides(self) -> None:
        """
        Removes rides older than 1 week from the data.
        """
        now = datetime.now()
        self.rides = [r for r in self.rides if
                      (now - r.ride_end.replace(tzinfo=None)).days < 2]

    def delete_ride(self, ride_id: str) -> None:
        """
        Deletes a ride given the ride ID.
        """
        self.rides = [r for r in self.rides if r.id != ride_id]
        for driver in self.drivers:
            driver.unavailable_timings = [t for t in driver.unavailable_timings
                                          if t[2] != ride_id]
        self._commit_changes()

    def delete_driver(self, driver_id: str) -> None:
        """
        Deletes a driver given the driver ID.
        """
        self.drivers = [d for d in self.drivers if d.id != driver_id]
        for ride in self.rides:
            if ride.assigned_driver is not None and ride.assigned_driver.id == driver_id:
                ride.assigned_driver = None
        self._commit_changes()

    def add_rides(self, rides: List[Ride]) -> None:
        """
        Adds ride objects that have already been created.
        """
        self.rides.extend(rides)
        self._commit_changes()

    def add_drivers(self, drivers: List[Driver]) -> None:
        """
        Adds driver objects that have already been created.
        """
        self.drivers.extend(drivers)
        self._commit_changes()

    def add_rides_by_csv(self, filepath: str) -> None:
        """
        Adds rides from a csv file.
        """
        self.rides.extend(get_rides_list(filepath))
        self._commit_changes()

    def add_drivers_by_csv(self, filepath: str) -> None:
        """
        Adds drivers from a csv file.
        """
        self.drivers.extend(get_drivers_list(filepath))
        self._commit_changes()

    def get_all_rides(self) -> dict:
        """
        Returns a dictionary with all rides.
        """
        rides = {}
        for r in self.rides:
            rides[r.id] = r
        return rides

    def get_all_drivers(self) -> dict:
        """
        Returns a dictionary with all drivers.
        """
        drivers = {}
        for d in self.drivers:
            drivers[d.id] = d
        return drivers

    def assign_driver_to_ride(self, driver_id: str, ride_id: str) -> bool:
        """
        Assigns <driver> to <ride> and returns if the operation was successful.

        The driver must not have a conflict with the ride.
        """
        driver = next((d for d in self.drivers if d.id == driver_id), None)
        ride = next((r for r in self.rides if r.id == ride_id), None)
        if driver and ride:
            if driver.add_accepted_ride(ride):
                ride.assign_driver(driver)
                self._commit_changes()
                return True
        return False

    def remove_driver_from_ride(self, driver_id: str, ride_id: str) -> bool:
        """
        Removes this driver assignment from the ride and returns if the operation was successful.
        """
        driver = next((d for d in self.drivers if d.id == driver_id), None)
        ride = next((r for r in self.rides if r.id == ride_id), None)
        if driver and ride and ride.assigned_driver:
            if ride.assigned_driver.id == driver.id:
                driver.unavailable_timings = [t for t in driver.unavailable_timings
                                              if t[2] != ride_id]
                ride.assigned_driver = None
                self._commit_changes()
                return True
        return False

    def add_rejected_pairing(self, driver_id: str, ride_id: str) -> None:
        """
        Adds this pairing to self.rejected to indicate that the user does
        not want this pairing to be suggested in the future.
        """
        self.rejected.add((driver_id, ride_id))
        self._commit_changes()

    def _filter_unmatched_rides(self) -> None:
        """
        Prepares the list of unmatched rides for the matching algorithm.
        """
        self.matches.clear()
        self.unmatched_rides.clear()
        for r in self.rides:
            if r.assigned_driver is None:
                r.possible_drivers.clear()
                self.unmatched_rides.append(r)

    def _is_suitable(self, driver: Driver, ride: Ride, dist_limit: int) -> bool:
        """
        Returns whether a driver is suitable for a ride.
        """
        dist_check = get_distance_between(driver.address, ride.pickup_address) < dist_limit
        reject_check = (driver.id, ride.id) not in self.rejected
        return dist_check and reject_check

    def _interpret_matches(self, graph: dict, match_dist: int) -> None:
        """
        Interprets the output graph of the matches and sets the ride objects appropriately.
        """
        for d in range(len(self.drivers)):
            key = f'd{d}'
            for ride, val in graph[key].items():
                if ride.startswith('r') and val == 0:
                    ride_obj = self.unmatched_rides[int(ride[1:])]
                    driver_obj = self.drivers[d]
                    distance = get_distance_between(driver_obj.address, ride_obj.pickup_address)
                    conflicts = driver_obj.get_conflicting_rides(ride_obj)
                    ride_obj.possible_drivers.append((driver_obj, distance, conflicts))
                    ride_obj.possible_drivers.sort(key=lambda x: x[1])
                    if ride not in self.matches:
                        self.matches[ride] = set()
                    self.matches[ride].add(key)
        # if no rides were assigned, keep trying to match until at least 1 match
        print(f'matches made: {len(self.matches)}, '
              f'rides unmatched: {len(self.unmatched_rides) - len(self.matches)}\n')
        if len(self.matches) < len(self.unmatched_rides) <= 200 and match_dist < 80:
            self.match(ceil(match_dist * 2))

    def match(self, max_dist: int = 10,
              max_ride_pairings_per_driver: int = 200,
              max_suggested_drivers_per_ride: int = 5) -> None:
        """
        Runs the matching algorithm to match the current pool of drivers and rides.

        Optional params:
            max_dist:
                maximum allowed distance between driver and ride start point
            max_ride_pairings_per_driver:
                maximum number of rides a driver can be potentially paired to
            max_suggested_drivers_per_ride:
                maximum number of driver suggestions for each ride
        """
        if not self.changed:
            return
        print(f'running match with max distance: {max_dist} kms')
        self._filter_unmatched_rides()
        start_node = 's'
        sink_node = 't'
        graph = {start_node: {},
                 sink_node: {}}
        for d in range(len(self.drivers)):
            key = f'd{d}'
            graph[start_node][key] = max_ride_pairings_per_driver
            graph[key] = {}
        for r in range(len(self.unmatched_rides)):
            key = f'r{r}'
            graph[key] = {sink_node: max_suggested_drivers_per_ride}
        for i, driver in enumerate(self.drivers):
            for j, ride in enumerate(self.unmatched_rides):
                if self._is_suitable(driver, ride, max_dist):
                    driver_key = f'd{i}'
                    ride_key = f'r{j}'
                    graph[driver_key][ride_key] = 1
        ford_fulkerson(graph, start_node, sink_node)
        self._interpret_matches(graph, max_dist)
        self.changed = False


if __name__ == '__main__':
    matcher = MatchMaker()
    # matcher.add_rides_by_csv('data/rides.csv')
    # matcher.add_drivers_by_csv('data/drivers.csv')
    matcher.match()
    # matcher.remove_old_rides()
    # for k, v in matcher.matches.items():
    #     print(k, v)
    # rds = matcher.get_all_rides()
    # for k, v in rds.items():
    #     print(f'id: {k}, obj: {v}')
    # dvs = matcher.get_all_drivers()
    # for k, v in dvs.items():
    #     print(f'id: {k}, obj: {v}')
