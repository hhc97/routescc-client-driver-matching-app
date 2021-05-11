import React, { useEffect, useState, useContext } from "react";
import FixedHeadTable from "./FixedHeaderTable";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { useHistory } from "react-router-dom";
import "./Trips.css";
import { NavBar } from "./NavBar";
import { TripsContext } from '../App';
import FormControl from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { config } from '../config';
import { postData } from '../functions/postData';

const url = config.api_host;

class TripFilters {
	constructor() {
		this.searchString = "";
		this.date = null;
		this.startTime = null;
		this.endTime = null;
		this.showUnmatched = true;
		this.showMatched = true;
	}

	setSearchString(rawSearchString) {
		this.searchString = rawSearchString.toLowerCase().trim();
	}

	//Takes the value from a time picker as input
	setStartTime(rawStartTime) {
		if (rawStartTime === "") {
			this.startTime = null;
		}

		this.startTime = new Date(rawStartTime);
	}

	//Takes the value from a time picker as input
	setEndTime(rawEndTime) {
		if (rawEndTime === "") {
			this.endTime = null;
		}
		
		this.endTime = new Date(rawEndTime);
	}

	setShowUnmatched(showUnmatched) {
		this.showUnmatched = showUnmatched;
	}

	setShowMatched(showMatched) {
		this.showMatched = showMatched;
	}

	clear() {
		this.searchString = "";
		this.date = null;
		this.startTime = null;
		this.endTime = null;
		this.showUnmatched = true;
		this.showMatched = true;
	}
}

export const columns = [
	{ 
		id: 'clientId',
		label: 'Client ID',
		minWidth: 70, 
		align: 'left'},
	{
		id: 'startTimeString',
		label: 'Start Time',
		minWidth: 70,
		align: 'left' },
	{
		id: 'endTimeString',
		label: 'End Time',
		minWidth: 70,
		align: 'left' },
	{
		id: 'pickupAddressStr',
		label: 'Pickup Address',
		minWidth: 70,
		align: 'left' },
	{
		id: 'destinationAddressStr',
		label: 'Destination Address',
		minWidth: 70,
		align: 'left' },
];


function filterTrip(trip, filters) {

	if (filters.searchString !== "") {
		if (!trip.clientId.toLowerCase().includes(filters.searchString)) {
			return false;
		}
	}

	if (filters.date != null) {
		//Compare only year, month, and day
		if (trip.date.getFullYear() !== filters.date.getFullYear() || trip.date.getMonth() !== filters.date.getMonth() || trip.date.getDate() !== filters.date.getDate()) {
			return false;
		}
	}

	if (filters.startTime != null) {
		if (trip.startTime < filters.startTime) {
			return false;
		}
	}

	if (filters.endTime != null) {
		if (trip.endTime > filters.endTime) {
			return false;
		}
	}

	if (!filters.showMatched && trip.assignedDriver != null) {
		return false;
	}

	if (!filters.showUnmatched && trip.assignedDriver == null) {
		return false;
	}

	return true;
}

export const Trips = () => {
	const history = useHistory();
	const { trips } = useContext(TripsContext);

	//State
	const [filters, setFilters] = useState(new TripFilters());
	const [filteredTrips, setFilteredTrips] = useState([]);
	const [filteredFlaggedTrips, setFilteredFlaggedTrips] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [checkboxState, setCheckboxState] = useState({
		checkUnmatched: true,
		checkMatched: true	
	});

	function initList() {
		//Iterate through the rows, checking if any entries should be flagged
		const flagged = [];
		const notFlagged = [];

		for (var i = 0; i < trips.length; i++) {
			if (trips[i].shouldFlag) {
				flagged.push(trips[i]);
			}
			else {
				notFlagged.push(trips[i]);
			}
		}

		return [notFlagged, flagged];
	}

	useEffect((() => {
		const values = initList();
		setFilteredTrips(values[0]);
		setFilteredFlaggedTrips(values[1]);

	}), [trips]);

	function filterTrips(filters) {
		const values = initList();

		setFilteredTrips(values[0].filter(trip => 
			filterTrip(trip, filters)
		));

		setFilteredFlaggedTrips(values[1].filter(trip => 
			filterTrip(trip, filters)
		));
	}	


	//Called whenever the add new trip button is clicked
	const handleAddTripOnClick = (event) => {
		history.push("/addTrip");
	}

	//Called whenever the search bar string is modified
	const handleSearchChange = (event) => {
		setSearchText(event.target.event);
		filters.setSearchString(event.target.value);
		filterTrips(filters);
	}

	//Called whenever the startTimePicker is modified
	const handleStartTimeChange = (event) => {
		setStartTime(event.target.value);
		filters.setStartTime(event.target.value);
		filterTrips(filters);
	}

	//Called whenever the endTimePicker is modified
	const handleEndTimeChange = (event) => {
		setEndTime(event.target.value);
		filters.setEndTime(event.target.value);
		filterTrips(filters);
	}

	const handleShowUnmatched = (event) => {
		setCheckboxState({ ...checkboxState, checkUnmatched: event.target.checked });
		filters.setShowUnmatched(event.target.checked);
		filterTrips(filters);
	}

	const handleShowMatched = (event) => {
		setCheckboxState({ ...checkboxState, checkMatched: event.target.checked });
		filters.setShowMatched(event.target.checked);
		filterTrips(filters);
	}

	const handleClear = (event) => {
		filters.clear();
		setSearchText("");
		setStartTime("");
		setEndTime("");
		setCheckboxState({
			checkMatched: true,
			checkUnmatched: true
		});
		filterTrips(filters);
	}

	//Called when a row in the table is clicked
	const handleRowClick = (event, row) => {
		history.push({
			"pathname": "/trip",
			"search": `?id=${row.id}`,
			"state": { data: row }
		});
	}

	//Called when the delete button in the table is clicked
	const handleDeleteClick = (event, row) => {
		event.preventDefault();
		event.stopPropagation();
		
		postData(
			`${url}/delete_ride`,
			{ ride_id: row.id }
		).then(res => {
			alert(res.message);
		});
	}

	return (
		<div>
			<NavBar />
			<div id="filterPanel">
				<div id="filterWrapper">
					<div className="filterSpacing">
						<form noValidate>
							<TextField
								id="time"
								label="Mininum Start Time"
								type="datetime-local"
								fullWidth
								onChange={handleStartTimeChange}
								value={startTime}
								InputLabelProps={{
									shrink: true,
								}}
								inputProps={{
									step: 300, // 5 min
								}}
							/>
						</form>
					</div>
					<div className="filterSpacing">
						<form noValidate>
							<TextField
								id="time"
								label="Maximum End Time"
								type="datetime-local"
								fullWidth
								onChange = {handleEndTimeChange}
								value={endTime}
								InputLabelProps={{
									shrink: true,
								}}
								inputProps={{
									step: 300, // 5 min
								}}
							/>
						</form>
					</div>
					<div className="filterSpacing">
						<FormControl>
							<FormControlLabel
								control={<Checkbox color='primary' checked={checkboxState.checkUnmatched} onClick={handleShowUnmatched}/>}
								label="Unmatched Trips"
							/>
							<FormControlLabel
								control={<Checkbox color='primary' checked={checkboxState.checkMatched} onClick={handleShowMatched}/>}
								label="Matched Trips"
							/>
						</FormControl>
					</div>
					<div id="filterSpacing">
						<Button variant="contained" color="primary" onClick={handleClear}>
							Clear
						</Button>
					</div>
				</div>
			</div>
			<div id="tablePanel">
				<div id="tableHeader">
					<div id="searchBarWrapper">
						<TextField
							onChange = { handleSearchChange }
							id="filled-search"
							label="Search Trips"
							type="search"
							value={searchText}
							fullWidth
							size="small"
							variant="outlined"
						/>
					</div>
					<div id="addButtonWrapper">
						<Button
							variant="contained"
							color="primary"
							size="small"
							startIcon={<AddIcon />}
							onClick={handleAddTripOnClick}
						>
							Add New Trip
						</Button>
					</div>
				</div>
				<div id="tableWrapper">
					<FixedHeadTable columns={columns} rows={filteredFlaggedTrips.concat(filteredTrips)} rowOnClick={handleRowClick} deleteOnClick={handleDeleteClick}/>
				</div>
			</div>
		</div>
	);
}