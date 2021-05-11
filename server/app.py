import datetime
import os

from flask import Flask, jsonify, request, flash, redirect, send_from_directory
from werkzeug.utils import secure_filename

from server.access_key_helpers import authenticate
from server.data.address_store import convert_address_to_coordinates
from server.matchmaker import MatchMaker
from server.objects.driver import Driver
from server.objects.rides import Ride

## Development

# for development, uncomment routes below

# app = Flask(__name__)

# @app.route('/')
# def dev():
#     return "Development ONLY"

# @app.after_request
# def allow_cors(response):
#     header = response.headers
#     header['Access-Control-Allow-Origin'] = '*'
#     header['Access-Control-Allow-Headers'] = '*'
#     header['Access-Control-Allow-Methods'] = '*'
#     return response


## Production

# for production, uncomment routes below

app = Flask(__name__, static_folder="../client/build")


@app.route("/")
def serve():
    """serves React App"""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    """serves static resources"""
    return send_from_directory(app.static_folder, path)


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


##########################################################################


app.secret_key = 'secret'


def _get_backend() -> MatchMaker:
    """
    Makes and returns a Matchmaker object.
    """
    matcher = MatchMaker()
    matcher.match()
    return matcher


@app.route('/login', methods=['POST'])
def verify_login():
    data = request.json
    if "access_token" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })
    token = data['access_token']
    if authenticate(token):
        return jsonify({
            "is_successful": True,
            "message": "logged in"
        })
    else:
        return jsonify({
            "is_successful": False,
            "message": "Invalid access token"
        })


def converter(o):
    if isinstance(o, datetime.datetime):  # because datetime objects in Ride are not json serializable
        return o.__str__()
    return o.__dict__


ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = os.getcwd() + os.sep + 'server' + os.sep + 'data'


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_backend', methods=['GET', 'POST'])
def upload_files():
    matcher = _get_backend()
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # try to add input data
            try:
                matcher.add_drivers_by_csv(filepath)
                return jsonify({
                    "is_successful": True,
                    "message": "Drivers file uploaded successfully"
                })
            except:
                try:
                    matcher.add_rides_by_csv(filepath)
                    return jsonify({
                        "is_successful": True,
                        "message": "Rides file uploaded successfully"
                    })
                except:
                    return jsonify({
                        "is_successful": False,
                        "message": "File failed to upload"
                    })


@app.route('/drivers')
def drivers():
    matcher = _get_backend()
    drivers = []
    for k, v in matcher.get_all_drivers().items():
        drivers.append(v.__dict__.copy())
    return jsonify(drivers)


@app.route('/rides')
def get_all_rides():
    matcher = _get_backend()
    rides = []
    for k, v in matcher.get_all_rides().items():
        ride = v.__dict__.copy()

        possible_drivers = []
        for driver, distance, conflicting_rides in ride["possible_drivers"]:
            possible_drivers.append({
                "driver": driver.__dict__.copy(),
                "distance": float("{:.2f}".format(distance)),
                "conflicting_rides": conflicting_rides,
            })

        ride["possible_drivers"] = possible_drivers
        rides.append(ride)

        if ride["assigned_driver"] is not None:
            ride["assigned_driver"] = ride["assigned_driver"].__dict__.copy()

    return jsonify(rides)


@app.route('/ride')
def get_single_ride():
    matcher = _get_backend()
    ride_id = request.args.get('ride_id')
    if not ride_id:
        return jsonify({"ride": None, "message": "Missing ride_id."})

    ride = None
    for k, v in matcher.get_all_rides().items():
        if v.id != ride_id:
            continue
        ride = v.__dict__.copy()

        possible_drivers = []
        for driver, distance, conflicting_rides in ride["possible_drivers"]:
            possible_drivers.append({
                "driver": driver.__dict__.copy(),
                "distance": float("{:.2f}".format(distance)),
                "conflicting_rides": conflicting_rides,
            })

        ride["possible_drivers"] = possible_drivers

        if ride["assigned_driver"] is not None:
            ride["assigned_driver"] = ride["assigned_driver"].__dict__.copy()

    return jsonify({"ride": ride, "message": f"Success fetching ride {ride_id}"})


@app.route('/assign', methods=['POST'])
def assign():
    matcher = _get_backend()
    data = request.json
    if "ride_id" not in data or "driver_id" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })

    ride_id, driver_id = data["ride_id"], data["driver_id"]
    if matcher.assign_driver_to_ride(driver_id, ride_id):
        return jsonify({
            "is_successful": True,
            "message": f"Successfully assigned driver {driver_id} to ride {ride_id}"
        })
    else:
        return jsonify({
            "is_successful": False,
            "message": f"Assignment failed, there was a conflict!"
        })


@app.route('/unassign', methods=['POST'])
def unassign():
    matcher = _get_backend()
    data = request.json
    if "ride_id" not in data or "driver_id" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })

    ride_id, driver_id = data["ride_id"], data["driver_id"]
    if matcher.remove_driver_from_ride(driver_id, ride_id):
        return jsonify({
            "is_successful": True,
            "message": f"Successfuly unassigned driver {driver_id} from ride {ride_id}"
        })
    else:
        return jsonify({
            "is_successful": False,
            "message": f"Driver {driver_id} was not assigned to ride {ride_id}"
        })


@app.route('/reject_pair', methods=['POST'])
def reject_pair():
    matcher = _get_backend()
    data = request.json
    if "ride_id" not in data or "driver_id" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })

    ride_id, driver_id = data["ride_id"], data["driver_id"]
    matcher.add_rejected_pairing(driver_id, ride_id)
    return jsonify({
        "is_successful": True,
        "message": "Pair rejected. This pair will not be recommended in the future."
    })


@app.route('/delete_ride', methods=['POST'])
def delete_ride():
    matcher = _get_backend()
    data = request.json
    if "ride_id" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })

    ride_id = data["ride_id"]
    matcher.delete_ride(ride_id)
    return jsonify({
        "is_successful": True,
        "message": "Ride deleted."
    })


@app.route('/delete_driver', methods=['POST'])
def delete_driver():
    matcher = _get_backend()
    data = request.json
    if "driver_id" not in data:
        return jsonify({
            "is_successful": False,
            "message": "Missing required arguments."
        })

    driver_id = data["driver_id"]
    matcher.delete_driver(driver_id)
    return jsonify({
        "is_successful": True,
        "message": "Driver deleted."
    })


@app.route('/upload/ride', methods=['POST'])
def upload_ride():
    matcher = _get_backend()
    data = request.json

    client_id = data["client_id"]
    start_time = datetime.datetime.strptime(data["start"], '%Y-%m-%dT%H:%M:%S%z')
    end_time = datetime.datetime.strptime(data["end"], '%Y-%m-%dT%H:%M:%S%z')
    pickup_address_str = data["pickup"]
    destination_address_str = data["destination"]

    new_ride = Ride(client_id, start_time, end_time,
                    convert_address_to_coordinates(pickup_address_str),
                    convert_address_to_coordinates(destination_address_str),
                    pickup_address_str,
                    destination_address_str)
    matcher.add_rides([new_ride])

    return jsonify({"message": "Successfully added a new trip", "is_successful": True})


@app.route('/upload/driver', methods=['POST'])
def upload_driver():
    matcher = _get_backend()
    data = request.json

    first_name = data["first_name"]
    last_name = data["last_name"]
    phone_number = data["phone_number"]
    cell_number = data["cell_number"]
    address = data["address"]
    city = data["city"]
    license_expiry = data["license_expiry"]

    new_driver = Driver(first_name, last_name, phone_number, cell_number,
                        convert_address_to_coordinates(address),
                        address,
                        city,
                        license_expiry)
    matcher.add_drivers([new_driver])

    return jsonify({"message": "Successfully added a new driver", "is_successful": True})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    app.run(host='0.0.0.0', port=port, debug=True)
