"""
This file constructs a graph from a list of drivers and rides to run our matching algorithm.
"""

from server.maps_api import get_distance_between

from server.objects.rides import Ride, get_rides_list
from server.objects.driver import Driver, get_drivers_list

from server.max_flow import ford_fulkerson


def is_suitable(driver: Driver, ride: Ride) -> bool:
    """
    Returns whether a driver is suitable for a ride.
    """
    return get_distance_between(driver.address, ride.pickup_address) < 15


def construct_graph(drivers_list: list, rides_list: list) -> dict:
    """
    Constructs a graph from the driver and ride lists.
    """
    start_node = 's'
    sink_node = 't'
    graph = {start_node: {},
             sink_node: {}}
    for d in range(len(drivers_list)):
        key = f'd{d}'
        graph[start_node][key] = 15
        graph[key] = {}
    for r in range(len(rides_list)):
        key = f'r{r}'
        graph[key] = {sink_node: 5}
    for i, driver in enumerate(drivers):
        for j, ride in enumerate(rides):
            if is_suitable(driver, ride):
                driver_key = f'd{i}'
                ride_key = f'r{j}'
                graph[driver_key][ride_key] = 1
    return graph


drivers = get_drivers_list('server/data/drivers.csv')
rides = get_rides_list('server/data/rides_short.csv')

if __name__ == '__main__':

    g = construct_graph(drivers, rides)
    ford_fulkerson(g, 's', 't')

    assigned = []
    for d in range(len(drivers)):
        key = f'd{d}'
        for ride, val in g[key].items():
            if ride.startswith('r') and val == 0:
                print(f'ride {ride} was assigned driver {key}')
                assigned.append(ride)
    for r in range(len(rides)):
        key = f'r{r}'
        if key not in assigned:
            print(f'ride {key} was not assigned a driver')
