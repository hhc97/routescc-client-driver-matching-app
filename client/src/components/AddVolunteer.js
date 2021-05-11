import React, { useState } from "react";
import TextField from '@material-ui/core/TextField';
import { NavBar } from "./NavBar";
import Button from '@material-ui/core/Button';
import "./AddTrip.css";
import { config } from '../config';
import { postData } from '../functions/postData';
import moment from 'moment';

export const AddVolunteer = () => {

	//State
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [cellNumber, setCellNumber] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [licenseExpiry, setLicenseExpiry] = useState(null);

	const handleFirstNameChange = (event) => { setFirstName(event.target.value); }
	const handleLastNameChange = (event) => { setLastName(event.target.value); }
	const handlePhoneNumberChange = (event) => { setPhoneNumber(event.target.value); }
	const handleCellNumberChange = (event) => { setCellNumber(event.target.value); }
	const handleAddressChange = (event) => { setAddress(event.target.value); }
	const handleCityChange = (event) => { setCity(event.target.value); }
	const handleLicenseExpiryChange = (event) => { setLicenseExpiry(new Date(event.target.value.concat("T00:00:00"))); }

	const handleSaveClick = (event) => {
			if(
			!firstName ||
			!lastName||
			!phoneNumber||
			!cellNumber||
			!address ||
			!city ||
			!licenseExpiry
		) alert("Please fill in all required fields!");

		postData(
			`${config.api_host}/upload/driver`,
			{ 
				first_name: firstName,
				last_name: lastName,
				phone_number: phoneNumber,
				cell_number: cellNumber,
				address: address,
				city: city,
				license_expiry: moment(licenseExpiry).format("DD/MM/yyyy") 
			}
		).then(res => alert(res.message))
	}

	return (
		<div>
			<NavBar />
			<div id="inputFieldPanel">
				<div className="inputField">
					<strong>Volunteer Name</strong>
					<div className="textFieldWrapper">
						<TextField
							defaultValue=""
							helperText="First Name"
							fullWidth
							onChange = {handleFirstNameChange}
						/>
						<TextField
							defaultValue=""
							helperText="Last Name"
							fullWidth
							onChange = {handleLastNameChange}
						/>
					</div>
				</div>
				<div className="inputField">
					<strong>Phone Number</strong>
					<div className="textFieldWrapper">
						<TextField
							defaultValue=""
							helperText="Phone Number"
							fullWidth
							onChange = {handlePhoneNumberChange}
						/>
						<TextField
							defaultValue=""
							helperText="Cell Number"
							fullWidth
							onChange = {handleCellNumberChange}
						/>
					</div>
				</div>
				<div className="inputField">
					<strong>Address</strong>
					<div className="textFieldWrapper">
						<TextField
							defaultValue=""
							helperText="Address"
							fullWidth
							onChange = {handleAddressChange}
						/>
						<TextField
							defaultValue=""
							helperText="Town/City"
							fullWidth
							onChange = {handleCityChange}
						/>
					</div>
				</div>
				<div className="inputField">
					<strong>Driver's License Expiry</strong>
					<div className="textFieldWrapper">
						<form noValidate>
							<TextField
								type="date"
								defaultValue=""
								onChange = {handleLicenseExpiryChange}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</form>
					</div>
				</div>
				<div>
					<Button
						variant="contained"
						color="primary"
						size="small"
						onClick={handleSaveClick}
					>
						Save New Volunteer
					</Button>
				</div>
			</div>
		</div>
	);
}