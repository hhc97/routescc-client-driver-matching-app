import React, { useContext } from "react";
import FixedHeadTable from "./FixedHeaderTable";
import { columns } from "./Trips";
import { TripsContext } from '../App';

export const ConflictingTrips = ({ conflictingTripsId }) => {
  const { trips } = useContext(TripsContext);

  return (
    <div>
      <FixedHeadTable columns={columns} rows={trips.filter(trip => conflictingTripsId.includes(trip.id))} rowOnClick={() => {}}/>
    </div>
  );
}