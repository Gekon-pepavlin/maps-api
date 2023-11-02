import * as L from "leaflet"
import {} from "proj4leaflet"


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
        crs: new L.Proj.CRS('EPSG:5514', "+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=100 +y_0=10000 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs",{
            resolutions: [
              4891.96999883583,
              2445.98499994708,
              1222.99250010583,
              611.496250052917,
              305.748124894166,
              152.8740625,
              76.4370312632292,
              38.2185156316146,
              19.1092578131615,
              9.55462890525781,
              4.77731445262891,
              2.38865722657904,
              1.19432861315723,
              0.597164306578613,
              0.298582153289307,
              0.149291076644653,
              0.0746455383223265,
              0.0373227691611632
            ],
            origin: [-951499.37, -930499.37],
          }),
          transform: (location: LocationPoint) => {
            return [location[0]+0.00007, location[1] + 0.00009]
          }
    },
    showMapScale: true
}