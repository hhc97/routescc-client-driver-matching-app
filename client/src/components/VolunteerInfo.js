import React from 'react';
import {Button, TableContainer, Table, TableRow, TableBody, TableCell, Avatar } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { NavBar } from "./NavBar";

export const VolunteerInfo = ({ location: { state: { data} } }) => {
	const {firstName, lastName, phone, cellPhone, addressString, driversLicenseExpiry} = data;
	const history = useHistory();
	
	const backOnClick = (event) => {
		history.push("./volunteers");
	}

	return (
		<div style={{ padding: 20}}>
			<NavBar />
				<Button onClick = { backOnClick }>
					Back
				</Button>
			<h1>Volunteer Info</h1>
			{/* Ignore avatar source for now */}
			<Avatar alt={`${firstName} ${lastName}`} src="./">
			{`${firstName.slice(0, 1)}${lastName.slice(0, 1)}`}
			</Avatar>
			<TableContainer>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>{`${firstName} ${lastName}`}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Phone</TableCell>
							<TableCell>{phone}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Cell phone</TableCell>
							<TableCell>{cellPhone}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Address</TableCell>
							<TableCell>
								<a href={`https://www.google.com/maps/search/?api=1&query=${addressString}`} target="_blank">{addressString}</a>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Driver's License Expiry</TableCell>
							<TableCell>{driversLicenseExpiry.toISOString().substring(0, 10)}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}