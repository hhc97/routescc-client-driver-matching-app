import React, { useState, useEffect } from "react";
import FixedHeadTable from "./FixedHeaderTable";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { useHistory } from "react-router-dom";
import "./Trips.css";
import { NavBar } from "./NavBar";
import { config } from '../config';
import { createDriverObject } from '../functions/createDriverObject';
import FormControl from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { postData } from '../functions/postData';

const url = config.api_host;

class VolunteerFilters {
	constructor() {
		this.searchString = "";
		this.showFlagged = true;
	}

	setSearchString(rawSearchString) {
		this.searchString = rawSearchString.toLowerCase().trim();
	}

	setShowFlagged(showFlagged) {
		this.showFlagged = showFlagged;
	}

	clear() {
		this.searchString = "";
		this.showFlagged = true;
	}
}

const columns = [
	{ 
		id: 'firstName',
		label: 'First Name',
		minWidth: 70, 
		align: 'left'},
	{ 
		id: 'lastName',
		label: 'Last Name',
		minWidth: 70,
		align: 'left'},
	{ 
		id: 'phone',
		label: 'Phone',
		minWidth: 70,
		align: 'left'},
	{
		id: 'cellPhone',
		label: 'Cell Phone',
		minWidth: 70,
		align: 'left' },
	{
		id: 'addressString',
		label: 'Address',
		minWidth: 70,
		align: 'left' }
];

export const Volunteers = () => {
	//State
	const history = useHistory();
	const [volunteers, setVolunteers] = useState([]);
	const [filters, setFilters] = useState(new VolunteerFilters());
	const [filteredVolunteers, setFilteredVolunteers] = useState([]);
	const [filteredFlaggedVolunteers, setFilteredFlaggedVolunteers] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [showFlagged, setShowFlagged] = useState(true);

	function initList() {
		//Iterate through the rows, checking if any entries should be flagged
		const flagged = [];
		const notFlagged = [];

		for (var i = 0; i < volunteers.length; i++) {
			if (volunteers[i].shouldFlag) {
				flagged.push(volunteers[i]);
			}
			else {
				notFlagged.push(volunteers[i]);
			}
		}

		return [notFlagged, flagged];
	}

	const url = config.api_host;

	useEffect(() => {
		fetch(`${url}/drivers`)
		.then(res => res.json())
		.then(res => {
			setVolunteers(res.map((volunteer) => createDriverObject({ driver: volunteer })));
		}); 
	}, []);

	useEffect(() => {
		const values = initList();
		setFilteredVolunteers(values[0]);
		setFilteredFlaggedVolunteers(values[1]);
	}, [volunteers])

	function filterVolunteer(volunteer, filters) {
			
		if (filters.searchString !== "") {
			if (!volunteer.firstName.toLowerCase().includes(filters.searchString) && !volunteer.lastName.toLowerCase().includes(filters.searchString)) {
				return false;
			}
		}

		if (!filters.showFlagged && volunteer.shouldFlag) {
			return false;
		}

		return true;
	}

	function filterVolunteers(filters) {
		const values = initList();

		setFilteredVolunteers(values[0].filter(volunteer => 
			filterVolunteer(volunteer, filters)
		));

		setFilteredFlaggedVolunteers(values[1].filter(volunteer => 
			filterVolunteer(volunteer, filters)
		));
	}

	//Called whenever the add new trip button is clicked
	const handleAddVolunteerOnClick = (event) => {
		history.push("/addVolunteer");
	}

	//Called whenever the search bar string is modified
	const handleSearchChange = (event) => {
		setSearchText(event.target.value);
		filters.setSearchString(event.target.value);
		filterVolunteers(filters);
	}

	const handleShowFlagged = (event) => {
		setShowFlagged(event.target.checked);
		filters.setShowFlagged(event.target.checked);
		filterVolunteers(filters);
	}

	const handleClear = (event) => {
		filters.clear();
		setSearchText("");
		setShowFlagged(true);
		filterVolunteers(filters);
	}

	//Called when a row in the table is clicked
	const handleRowClick = (event, row) => {
		history.push({
			"pathname": "/volunteer",
			"search": `?id=${row.id}`,
			"state": { data: row }
		});
	}

	//Called when the delete button in the table is clicked
	const handleDeleteClick = (event, row) => {
		event.preventDefault();
		event.stopPropagation();

		postData(
			`${url}/delete_driver`,
			{ driver_id: row.id }
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
						<FormControl>
							<FormControlLabel
								control={<Checkbox color='primary' checked={showFlagged} onClick={handleShowFlagged}/>}
								label="Flagged Volunteers"
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
							label="Search Volunteers"
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
							onClick={handleAddVolunteerOnClick}
						>
							Add New Volunteer
						</Button>
					</div>
				</div>
				<div id="tableWrapper">
					<FixedHeadTable columns={columns} rows={filteredFlaggedVolunteers.concat(filteredVolunteers)} rowOnClick={handleRowClick} deleteOnClick={handleDeleteClick}/>
				</div>
			</div>
		</div>
	);
}