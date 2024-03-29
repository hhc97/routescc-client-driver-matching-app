"""
This module acts as a helper for access key management.

Running this module directly will set the allowed access keys on the server
to whatever is specified in a 'access_keys.txt' file in the same directory.
"""

from random import choice
from string import ascii_letters

import server.mongo_helpers as db

COLLECTION_NAME = 'access_keys'
FIELD_NAME = 'keys'
KEY_FILE = 'access_keys.txt'

LOG_COLLECTION = 'access_logs'


def authenticate(key: str) -> bool:
    """
    Returns a boolean value indicating if this key is a valid key.
    Also logs the attempt in the database.
    """
    keys = db.get_latest(COLLECTION_NAME).get(FIELD_NAME, [])
    success = key in keys
    if success:
        db.add_to_db(LOG_COLLECTION, {'message': f'User logged in with key "{key}".'})
    else:
        db.add_to_db(LOG_COLLECTION, {'message': f'Failed attempt to log in with key "{key}".'})
    return success


def _set_keys() -> None:
    """
    Communicates with the database to set valid access keys.
    """
    try:
        open(KEY_FILE).close()
    except FileNotFoundError:
        open(KEY_FILE, 'w').close()

    with open(KEY_FILE, 'r') as f:
        keys = [k for k in set(f.read().split('\n')) if k]
        db.add_to_db(COLLECTION_NAME, {FIELD_NAME: keys})


def _generate_random_key(length: int) -> str:
    number_strings = ''.join(str(i) for i in range(10))
    all_choices = ascii_letters + number_strings
    return ''.join(choice(all_choices) for _ in range(length))


if __name__ == '__main__':
    _set_keys()
    print(authenticate('admin'))
