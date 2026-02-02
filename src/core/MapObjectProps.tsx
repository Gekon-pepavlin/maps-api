import * as L from "leaflet";

import { LocationPoint } from "./LocationPoint";

export interface CustomProjection {
    crs: L.CRS;
    transform: (location: LocationPoint) => LocationPoint;
}

export interface MapObjectProps {
    projection: CustomProjection;
    startLocation: LocationPoint;
}

export const defaultMapObjectProps: MapObjectProps = {
    projection: {
        crs: L.CRS.EPSG3395,
        transform: (location: LocationPoint) => {
            return [location[0], location[1]];
        }
    },
    startLocation: [50.018127619248084, 14.296341504868012]
};
