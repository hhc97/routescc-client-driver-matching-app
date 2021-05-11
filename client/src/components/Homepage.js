import React from "react";
import {Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";


const useStyles = makeStyles({
  mainGrid: {
      margin: "auto",
	  width: "50%",
      height: "auto",
      borderRadius: "25",
      boxShadow: "0",
      paddingLeft: "50px",
      paddingRight: "50px",
      paddingBottom: "50px",
      paddingTop: "10px"
  },
  button: {
	backgroundColor: '#00bcd4',
	minWidth: 275,
	minHeight: 55
  }
});

const buttons = [
  {route: "/trips", title: "Book Trips"},
  {route: "/volunteers", title: "View Volunteers"},
  {route: "/addTrip", title: "Add New Trip"},
  {route: "/addVolunteer", title: "Add New Volunteer"},
  {route: "/matching", title: "Confirmed Matchings"},
  {route: "/upload", title: "Upload Files"}
];

export const Homepage = () => {
  const history = useHistory();
  const classes = useStyles();

  return ( 
    <div>
	<Typography style={{padding: '2%'}} color="textPrimary" gutterBottom variant="h2" align="center">Routes Connecting Communities</Typography>
    <Grid container alignItems="center"  justify="center"  className={classes.mainGrid}  spacing={4}>
		{ buttons.map(({ route, title }, index) => (
			<Grid item key={index}>
				<Button variant="contained" className={classes.button} size="large" onClick={() => history.push(route)}>
					{title}
				</Button>
			</Grid>
		))}
    </Grid>
    </div>
  )
}