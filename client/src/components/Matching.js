import React, { useState, useContext } from "react";
import { Button, Box, TextField, Tooltip } from "@material-ui/core";
import Timetable from 'react-timetable-events';
import moment from 'moment';
import { NavBar } from "./NavBar";
import { TripsContext } from '../App';

//TODO add date selector
//TODO make grid scale with window + remove hardcoded position values
//TODO add info to trip buttons
//TODO add dropdown showing unmatched trips

//TODO link driver buttons to driver info pages
//TODO link trip buttons to trip info pages

function createDateObject(rawDate) {
  if (rawDate === "") {
    return new Date();
  }
  else {
    var values = rawDate.split('-');
    return new Date(values[0], parseInt(values[1]) - 1, values[2]);
  }
}

const getEventsFromTrips = ({ trips }) => {
  let events = {};

  const drivers = trips
    .map(trip => trip.assignedDriver)
    .map(driver => `${driver.first_name} ${driver.last_name}`)
    .filter((driverName, index, arr) => arr.indexOf(driverName) === index);

  for(const driverName of drivers) {
    events[driverName] = trips
      .filter(trip => {
        const { first_name, last_name } = trip.assignedDriver;
        const tripDriverName = `${first_name} ${last_name}`;
        return tripDriverName === driverName;
      })
      .map((trip, index) => ({
        id: trip.id,
        name: trip.clientId,
        startTime: moment(trip.startTime).utc(),
        endTime: moment(trip.endTime).utc()
      }));
  }

  return events;
};

const incrementDate = ({ date, days }) => {
  const momentObjInput = moment(date);
  const momentObjOutput = momentObjInput.add(days, 'day');

  return momentObjOutput.toDate(); 
};

export const Matching = () => {
  const { trips } = useContext(TripsContext);
  const [date, setDate] = useState(new Date());

  const filteredTrips = trips.filter((trip) => {
    const isTripOnSameDayAsDate = moment(trip.date).isSame(moment(date), 'day');
    return trip.assignedDriver && isTripOnSameDayAsDate;
  });

  const events = getEventsFromTrips({ trips: filteredTrips });

  return (
    <Box>
      <NavBar />
      <Box style={{margin: 'auto', width: 922}}>
        <div style={{margin: 'auto', width: '50%', padding: 2, display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={() => setDate(incrementDate({ date, days: -1 }))}>Prev</Button>
          <form noValidate>
            <TextField
              id="date"
              label="Date"
              type="date"
              fullWidth
              onChange = {(event) => setDate(createDateObject(event.target.value))}
              value={moment(date).format("yyyy-MM-DD")}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </form>
          <Button onClick={() => setDate(incrementDate({ date, days: 1 }))}>Next</Button>
        </div>
        {
          Object.keys(events).length > 0  &&
          <Timetable 
            events={events} 
            hoursInterval={[9, 17]}
            renderEvent={(event, defaultAttributes, styles) => {
              return (
                <div {...defaultAttributes}
                    title={event.name}
                    key={event.id}>
                  <Tooltip title={`${event.startTime.format('ddd, DD/MM/yyyy, hh:mm')} - ${event.endTime.format('hh:mm')}`}>
                    <a 
                      style={{ textAlign: 'center', fontSize: 20 }}
                      href={`/trip?id=${event.id}`}
                      target="_blank"
                    >
                      { event.name }
                    </a>
                  </Tooltip>
                </div>
              )
            }}
          />
        }
      </Box>
    </Box>
  );
}
