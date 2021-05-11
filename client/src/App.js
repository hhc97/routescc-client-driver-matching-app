import React, { useState, createContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from './components/Login'
import { Homepage } from './components/Homepage';
import { Search } from './components/Search';
import { Trips } from './components/Trips';
import { TripInfo } from './components/TripInfo';
import { AddTrip } from './components/AddTrip';
import { Volunteers } from './components/Volunteers';
import { VolunteerInfo } from "./components/VolunteerInfo";
import { AddVolunteer } from './components/AddVolunteer';
import { Matching } from './components/Matching';
import { Upload } from './components/Upload';
import { createTripObject } from './functions/createTripObject';
import { config } from './config';
import { postData } from './functions/postData'

export const TripsContext = createContext({ trips: [], setTrips: () => { } });


export function App() {
  const [trips, setTrips] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const url = config.api_host;


  useEffect(() => {
    fetch(`${url}/rides`)
      .then(res => res.json())
      .then(res => {
        setTrips(res.map((trip) => createTripObject({ trip })));
      })
    if (!loggedIn) {
      checkLoggedIn()
    }
  }, []);


  const checkLoggedIn = async () => {
    await postData(`${url}/login`, { access_token: sessionStorage.getItem('user') })
      .then(res => {
        if (res.is_successful) {
          setLoggedIn(true)
        }
      })
      .catch(e => { console.log(e); })
  };

  if (!loggedIn) {
    return (
      <Router>
        <Switch>
          <Route exact path="/*" component={Login} />
        </Switch>
      </Router>
    )
  }

  return (
    <TripsContext.Provider value={{ trips, setTrips }}>
      <Router>
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route exact path="/search" component={Search} />
          <Route exact path="/trips" component={Trips} />
          <Route exact path="/trip" component={TripInfo} />
          <Route exact path="/addTrip" component={AddTrip} />
          <Route exact path="/volunteers" component={Volunteers} />
          <Route exact path="/volunteer" component={VolunteerInfo} />
          <Route exact path="/addVolunteer" component={AddVolunteer} />
          <Route exact path="/matching" component={Matching} />
          <Route exact path="/upload" component={Upload} />
          <Route exact path="/*" component={Trips} />
        </Switch>
      </Router>
    </TripsContext.Provider>
  );
};