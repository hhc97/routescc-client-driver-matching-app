"""
A class to facilitate storing and retrieving data.
"""

import server.mongo_helpers as db
from server.maps_api import get_coordinates, google_api_key

COLLECTION_NAME = 'locations'
MAPPING_KEY = 'mapping'


class AddressStore:
    def __init__(self) -> None:
        """
        Initializes the class.
        """
        self.mapping = {}

        cached = db.get_latest(COLLECTION_NAME)
        if MAPPING_KEY in cached:
            for loc, coords in cached[MAPPING_KEY].items():
                self.mapping[loc] = tuple(coords)

    def get_coord(self, string_location: str,
                  approximate_area: str = ' Ontario, Canada') -> tuple:
        """
        Returns the coordinates of the place the string represents.

        An approximate area can be specified, since addresses by street and house number
        are not unique. This area defaults to Ontario, Canada
        """
        string_location += approximate_area
        if string_location not in self.mapping:
            self.mapping[string_location] = get_coordinates(string_location, google_api_key)
            self._commit()
        return self.mapping[string_location]

    def _commit(self) -> None:
        """
        Commits any updated files to memory.
        """
        db.add_to_db(COLLECTION_NAME, {MAPPING_KEY: self.mapping})


def convert_address_to_coordinates(address_string: str) -> tuple:
    """
    A wrapper that uses the AddressStore class to convert an address string
    to geographical coordinates.
    """
    store = AddressStore()
    return store.get_coord(address_string)


if __name__ == '__main__':
    test = AddressStore()
    print(test.mapping)
    print(len(test.mapping))
    print(convert_address_to_coordinates('University of Toronto'))
