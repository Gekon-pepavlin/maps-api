import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
import Map from './Map'
import * as L from "leaflet"
import Marker, { MapOptions, createMarker } from './Marker'
import Geometry, { createGeometry } from './Geometry';
import {} from "proj4leaflet"


export const projection = L.CRS.EPSG3395;
export default function useMap() {
    const divRef = useRef(null);
  
    const mapRef = useRef<MapOptions>(null);

    const [ref, setRef] = useState<MapOptions>();

    const [markers, setMarkers] = useState<Marker[]>([]);
    const [geometries, setGeometries] = useState<Geometry[]>([]);

    const container = useMemo(()=>Map(divRef), []);

    // Initialize map and set to the state
    useEffect(()=>{
        if(divRef.current === null){
            console.log("Div-reference is null");
            return;
        };
        try{

            const map = L.map(divRef.current, {
                zoomControl: false,
                crs: projection
            
            });
            map.setView(new L.LatLng(50.01942, 14.29694), 18);
        
            L.tileLayer.wms("https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/WMService.aspx", {
                layers: "GR_ORTFOTORGB",
                maxZoom : 20, 
                styles: "",
                format: "image/png",
                transparent: true,
                version: "1.3.0",
                attribution: "ČÚZK"
            }).addTo(map);

            //@ts-ignore
            mapRef.current = map;
            setRef(map);

        }catch(e){
            console.log(e);
        } // Because map was creating twice on same div
    },[])

    const addMarker = ( marker: Marker) => {
        
        if(!mapRef.current) return marker;
        
        marker.attachMap(mapRef.current);
        setMarkers((m)=>[...m, marker])


        return marker;
    }

    const addGeometry = (geometry: Geometry) => {
        if(!mapRef.current) return geometry;
        
        geometry.attachMap(mapRef.current);
        setGeometries((m)=>[...m, geometry])


        return geometry;
    }


    const createMarkerAndAdd = (latitude: number, longitude: number, marker: (marker: Marker, map: MapOptions)=>React.ReactElement) => {
        const m = createMarker(latitude, longitude, marker) ;
        addMarker( m);
        return m;
    }

    const createGeometryAndAdd = (points: L.LatLngExpression[]) => {
        const m = createGeometry(points) ;
        addGeometry( m);
        return m;
    }

    return {
        container,
        createMarker: createMarkerAndAdd,
        createGeometry: createGeometryAndAdd,
        addMarker,
        addGeometry,
        markers,
        geometries,
        projection,
        ref: ref as MapOptions
    }
}
