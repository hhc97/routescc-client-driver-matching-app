from geopy import distance
from googlemaps import Client as GoogleMaps

google_api_key = "AIzaSyA5Ryv0KYWdNKYAXsxGSwlC6oaD5q9iCI4"


def get_coordinates(address: str, api_key: str) -> tuple:
    """ 
    Takes in a string address and Google API key.
    Returns a tuple with latitude and longitude.
    """
    gmaps = GoogleMaps(api_key)
    geocode_result = gmaps.geocode(address)
    try:
        lat = geocode_result[0]['geometry']['location']['lat']
        long = geocode_result[0]['geometry']['location']['lng']
        return lat, long
    except IndexError:
        print(f'Error: coordinates not found for location: {address}')
        return 0, 0


def get_distance_between(src: tuple, target: tuple) -> float:
    """
    Takes in coordinates of two locations as tuples.
    Returns the distance between the locations in km.
    """
    return distance.distance(src, target).km


if __name__ == '__main__':
    # GeoAPI with full address and postal code.
    # Full addresss example.
    uni = get_coordinates("27 King's College Cir, Toronto, ON M5S", google_api_key)
    # Postal Code example.
    uni_post = get_coordinates("ON M5S", google_api_key)
    print("Full address:", uni, "\nPostal Code:", uni_post)

    # Coordinates Distance test
    loc1 = get_coordinates("27 King's College Cir, Toronto, ON M5S", google_api_key)
    loc2 = get_coordinates("6301 Silver Dart Dr, Mississauga, ON L5P 1B2", google_api_key)
    print("UofT:", loc1, "\nPearson Airport:", loc2)
    dist = get_distance_between(loc1, loc2)
    print("Distance:", dist, "km")
