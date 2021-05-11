import React, { useState } from "react";
import TextField from '@material-ui/core/TextField';
import { NavBar } from "./NavBar";
import Button from '@material-ui/core/Button';
import "./AddTrip.css";
import { config } from '../config';
import { postData } from '../functions/postData';
import moment from 'moment';

export const AddTrip = () => {

	//State
	const [clientID, setClientID] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [pickupAddress, setPickupAddress] = useState("");
	const [destinationAddress, setDestinationAddress] = useState("");

	const handleClientIDChange = (event) => {
		setClientID(event.target.value);
	}

	const handleStartDateChange = (event) => {
		setStartDate(new Date(event.target.value));
	}

	const handleEndDateChange = (event) => {
		setEndDate(new Date(event.target.value));
	}

	const handlePickupAddressChange = (event) => {
		setPickupAddress(event.target.value);
	}

	const handleDestinationAddressChange = (event) => {
		setDestinationAddress(event.target.value);
	}

	const handleSaveClick = (event) => {
		if(
			!clientID ||
			!startDate ||
			!endDate ||
			!pickupAddress ||
			!destinationAddress
		) alert("Please fill in all required fields!");

		postData(
			`${config.api_host}/upload/ride`,
			{ 
				client_id: clientID, 
				start: moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss') + "Z", 
				end: moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss') + "Z",
				pickup: pickupAddress,
				destination: destinationAddress
			}
		).then(res => alert(res.message))
	}

	return (
		<div>
			<NavBar />
			<div id="inputFieldPanel">
				<div className="inputField">
					<strong>Client ID</strong>
					<div className="textFieldWrapper">
						<TextField
							fullWidth
							onChange = {handleClientIDChange}
						/>
					</div>
				</div>
				<div className="inputField">
					<strong>Date And Time</strong>
					<div className="textFieldWrapper">
						<form noValidate>
							<TextField
								type="datetime-local"
								defaultValue=""
								helperText="Start Date and Time"
								onChange = {handleStartDateChange}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</form>
						<form noValidate>
							<TextField
								type="datetime-local"
								defaultValue=""
								helperText="End Date and Time"
								onChange = {handleEndDateChange}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</form>
					</div>
				</div>
				<div className="inputField">
					<strong>Pickup Address</strong>
					<div className="textFieldWrapper">
							<TextField
								defaultValue=""
								fullWidth
								onChange = {handlePickupAddressChange}
							/>
					</div>
				</div>
				<div className="inputField">
					<strong>Destination Address</strong>
					<div className="textFieldWrapper">
							<TextField
								defaultValue=""
								fullWidth
								onChange = {handleDestinationAddressChange}
							/>
					</div>
				</div>
				<div>
					<Button
						variant="contained"
						color="primary"
						size="small"
						onClick={handleSaveClick}
					>
						Save New Trip
					</Button>
				</div>
			</div>
		</div>
	);
}