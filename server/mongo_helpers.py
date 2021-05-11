import os

import pymongo

CONN_STRING = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')

client = pymongo.MongoClient(CONN_STRING, serverSelectionTimeoutMS=5000)

db = client.routescc


def add_to_db(collection_name: str, document: dict) -> None:
    """
    Inserts a document into the DB.
    """
    collection = db[collection_name]
    collection.insert_one(document)


def find_from_db(collection_name: str, specifications: dict) -> dict:
    """
    Finds a document from the database if there is one.
    """
    collection = db[collection_name]
    return collection.find_one(specifications)


def clear_and_write(collection_name: str, documents: list) -> None:
    """
    Clears a collection and writes in fresh data to it.
    """
    collection = db[collection_name]
    collection.drop()
    collection.insert_many(documents)


def get_all(collection_name: str) -> list:
    """
    Returns all entries in a collection.
    """
    collection = db[collection_name]
    return list(collection.find())


def get_latest(collection_name: str) -> dict:
    """
    Returns the latest entry in the collection.
    """
    collection = db[collection_name]
    try:
        last_entry = next(collection.find().sort('_id', -1))
        collection.delete_many({'_id': {'$ne': last_entry['_id']}})
        return last_entry
    except StopIteration:
        return {}


if __name__ == '__main__':
    col_name = 'tester'
    # add_to_db(col_name, {'a': 4})
    # add_to_db(col_name, {'a': 5})
    # add_to_db(col_name, {'a': 6})
    print(get_latest(col_name))
