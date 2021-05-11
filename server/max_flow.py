from random import shuffle


def get_path(network: dict, source: str, sink: str, seen=None) -> list:
    """
    Returns a path with positive capacity from <source> to <sink>,
    or None if there is no such path. This is done through a recursive DFS.
    """
    if seen is None:
        seen = set()
    seen.add(source)

    to_visit = list(network[source].keys())
    shuffle(to_visit)
    for node in to_visit:
        if node not in seen:
            capacity = network[source][node]
            if capacity > 0:
                if node == sink:
                    return [[node, capacity]]
                path = get_path(network, node, sink, seen)
                if path:
                    return [[node, capacity]] + path
    return []


def add_residuals(network: dict) -> None:
    """
    Adds backward edges along the network to create a residual graph.
    """
    for node, edges in network.items():
        for key in edges:
            if node not in network[key]:
                network[key][node] = 0


def augment_flow(network: dict, path: list, amount: int) -> None:
    """
    Augments the flow along <path> by <amount> and updates the network.
    """
    for i in range(len(path) - 1):
        flow_out, flow_in = path[i], path[i + 1]
        # deduct augmented flow from forward edge
        network[flow_out][flow_in] -= amount
        # add augmented flow to reverse edge
        network[flow_in][flow_out] += amount


def ford_fulkerson(network: dict, source: str, sink: str) -> int:
    """
    The Ford-Fulkerson algorithm for maximum flow.

    >>> d = {'s': {'a': 9, 'b': 8, 'd': 5},
    ...      'a': {'c': 6, 't': 5},
    ...      'b': {'a': 3, 'c': 9, 'd': 4},
    ...      'c': {'t': 9},
    ...      'd': {'c': 4, 't': 7},
    ...      't': {}}
    >>> ford_fulkerson(d, 's', 't')
    21

    >>> d = {'s': {'2': 10, '3': 5, '4': 15},
    ...      '2': {'3': 4, '5': 9, '6': 15},
    ...      '3': {'4': 4, '6': 8},
    ...      '4': {'7': 30},
    ...      '5': {'6': 15, 't': 10},
    ...      '6': {'7': 15, 't': 10},
    ...      '7': {'3': 6, 't': 10},
    ...      't': {}}
    >>> ford_fulkerson(d, 's', 't')
    28
    """
    # make residual graph by initializing reverse edges to 0
    add_residuals(network)
    # find a path from source to sink in the residual graph
    path = get_path(network, source, sink)
    # while a path exists from source to sink, augment the flow along that path
    while path:
        augment_flow(network,
                     [source] + [n[0] for n in path],
                     min(n[1] for n in path))
        # check if another path exists, repeat
        path = get_path(network, source, sink)
    return sum(network[sink].values())


if __name__ == '__main__':
    import doctest

    doctest.testmod()
