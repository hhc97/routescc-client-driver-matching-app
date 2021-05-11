import React, { useState, createContext, useContext, useEffect } from 'react';
import { Link, Button, TableContainer, Table, TableRow, TableBody, TableCell, List, ListItem, ListItemSecondaryAction, ListItemText, Typography, Modal } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { NavBar } from "./NavBar";
import { config } from '../config';
import { ConflictingTrips } from './ConflictingTrips';
import { createTripObject } from '../functions/createTripObject';
import { TripsContext } from '../App';
import { postData } from '../functions/postData';

const url = config.api_host;

// Context
const TripContext = createContext({ trip: null, setTrip: () => {} });

//Components
const PossibleDriver = ({ driver, distance, conflictingTrips }) => {
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);	
	const { trip, setTrip } = useContext(TripContext);
	const { setTrips } = useContext(TripsContext);
	
	const history = useHistory();
	const isAssignedDriver = trip.assignedDriver ? (trip.assignedDriver.id === driver.id) : 0;
	const conflictingTripsCount = conflictingTrips.length;

	const onAssignClicked = () => {
		setLoading(true);
		postData(
			`${url}/${isAssignedDriver ? "unassign" : "assign"}`,
			{ driver_id: driver.id, ride_id: trip.id }
		).then(res => {
			alert(res.message);
			if(res.is_successful) {
				fetch(`${url}/ride?ride_id=${trip.id}`)
					.then(res => res.json())
					.then(res => {
						const newTrip = createTripObject({ trip: res.ride });

						history.push({
							"pathname": "/trip",
							"search": `?id=${trip.id}`,
							"state": { data: newTrip }
						});
						setTrip(newTrip);
					});

				fetch(`${url}/rides`)
					.then(res => res.json())
					.then(res => {
						setTrips(res.map((trip) => createTripObject({ trip }) ));
					});

			}
			setLoading(false);
		});
	}

	const onRejectClicked = () => {
		setLoading(true);
		postData(
			`${url}/reject_pair`,
			{ driver_id: driver.id, ride_id: trip.id }
		).then(res => {
			alert(res.message);

			fetch(`${url}/ride?ride_id=${trip.id}`)
			.then(res => res.json())
			.then(res => {
				const newTrip = createTripObject({ trip: res.ride });

				history.push({
					"pathname": "/trip",
					"search": `?id=${trip.id}`,
					"state": { data: newTrip }
				});
				setTrip(newTrip);
			});

		fetch(`${url}/rides`)
			.then(res => res.json())
			.then(res => {
				setTrips(res.map((trip) => createTripObject({ trip }) ));
			});

			setLoading(false);
		})
	}

	return (
		<>
			<Modal
				open={showModal}
				onClose={() => setShowModal(false)}
				id="conflictingTripsModal"
			>
				<ConflictingTrips 
					conflictingTripsId={conflictingTrips}
				/>
			</Modal>
			<ListItem>
				<ListItemText
					primary={`${driver.first_name} ${driver.last_name}`}
					secondary={
						distance && 
						<React.Fragment>
							<Typography>
								{`${distance} kilometers away`}
							</Typography>
							{
								conflictingTripsCount > 0 &&
								<Link onClick={() => setShowModal(true)}>
									See {conflictingTripsCount} conflicting rides
								</Link>
							}
						</React.Fragment>
					}
				/>
				<ListItemSecondaryAction>
					<Button 
						color={isAssignedDriver ? "secondary" : "primary"}
						disabled={loading}
						variant="contained"
						onClick={() => onAssignClicked()}
						style={{ marginRight: 5 }}
					>
						{isAssignedDriver ? "Unassign" : (loading ? "Loading" : "Assign")}
					</Button>
					<Button 
						color={"secondary"}
						disabled={loading}
						variant="contained"
						onClick={() => onRejectClicked()}
					>
						{loading ? "Loading" : "Reject"}
					</Button>
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}

export const TripInfo = ({ location }) => {
	const history = useHistory();
	const { state } = location;
	const [trip, setTrip] = useState(state && state.data ? state.data : null);
	
	useEffect(() => {
		if(!trip) {
			const tripId = new URLSearchParams(location.search).get("id")
			fetch(`${url}/ride?ride_id=${tripId}`)
				.then(res => res.json())
				.then(res => {
						const newData = createTripObject({ trip: res.ride });
						history.push({
							"pathname": "/trip",
							"search": `?id=${tripId}`,
							"state": { data: newData }
						});
						setTrip(newData);
				});
		}
	}, []);


	if(!trip) return (<></>);

	const {
		id, 
		clientId, 
		date, 
		dateString, 
		startTime, 
		startTimeString, 
		endTime, 
		endTimeString,
		pickupAddressStr, 
		destinationAddressStr,
		possibleDrivers,
		assignedDriver
	} = trip;
	
	const backOnClick = (event) => {
		history.push("./trips");
	}

	return (
		<TripContext.Provider value={{ trip, setTrip }}>
		<div style={{padding: 20}}>
			<NavBar />
				<Button onClick = { backOnClick }>
					Back
				</Button>
			<h1>Trip Info</h1>
			<TableContainer>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell>Client ID</TableCell>
							<TableCell>{`${clientId}`}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell>{dateString}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Start Time</TableCell>
							<TableCell>{startTimeString}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>End Time</TableCell>
							<TableCell>{endTimeString}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Pickup Address</TableCell>
							<TableCell>
								<a href={`https://www.google.com/maps/search/?api=1&query=${pickupAddressStr}`} target="_blank">{pickupAddressStr}</a>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Destination Address</TableCell>
							<TableCell>
								<a href={`https://www.google.com/maps/search/?api=1&query=${destinationAddressStr}`} target="_blank">{destinationAddressStr}</a>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
			<h1>Possible drivers</h1>
			<List style={{maxWidth: 'max(50%, 800px)'}}>
				{assignedDriver && <PossibleDriver driver={assignedDriver} conflictingTrips={[]}/>}
				{possibleDrivers.map(({ driver, distance, conflicting_rides: conflictingTrips }) => <PossibleDriver key={driver.id} driver={driver} distance={distance} conflictingTrips={conflictingTrips}/>)}
			</List>
		</div>
		</TripContext.Provider>
	);
}
