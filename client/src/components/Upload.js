import React, { useState } from "react";
import "./Upload.css";
import { NavBar } from "./NavBar";
import { config } from '../config';


export const Upload = () => {
	
	//State
	const [volunteerFile, setVolunteerFile] = useState(null);
	// const [tripFile, setTripFile] = useState(null);

	const onVolunteerFileChange = (event) => {
		setVolunteerFile(event.target.files[0]);
	}

	const url = config.api_host;

	const handleSubmission = () => {
	  console.log("submit")
	  const formData = new FormData();
  
	  formData.append('file', volunteerFile);
  
	  fetch(
		  `${url}/upload_backend`,
		  {
			  method: 'POST',
			  body: formData,
		  }
	  )
		  .then((response) => response.json())
		  .then(res => alert(res.message))
		  .then((result) => {
			  console.log('Success:', result);
		  })
		  .catch((error) => {
			  console.error('Error:', error);
		  });
  };

	return (
		<div>
			<NavBar />
			<div id="buttonPanel">
				<div className="buttonEntry">
					<strong>Upload CSV File</strong>
					<div>
						<input type="file" onChange={onVolunteerFileChange} />
						<button onClick={handleSubmission}>
							Upload
						</button>
					</div>
			</div>
			</div>
		</div>
	);
}