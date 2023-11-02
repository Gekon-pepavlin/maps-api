import * as L from "leaflet"

import { LocationPoint } from "./LocationPoint"

export interface CustomProjection{
    crs: L.CRS,
    transform: (location: LocationPoint) => LocationPoint
}

export interface MapObjectProps{
    projection: CustomProjection,
    showMapScale: boolean,
}

export const defaultMapObjectProps : MapObjectProps = {
    projection: {
        crs: L.CRS.EPSG3395,
          transform: (location: LocationPoint) => {
            return [location[0], location[1]]
          }
    },
    showMapScale: true
}