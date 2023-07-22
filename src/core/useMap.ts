import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
import Map from './Map'
import * as L from "leaflet"
import Marker, { MapOptions, createMarker } from './Marker'
import Geometry, { createGeometry } from './Geometry';
import {} from "proj4leaflet"
import { LocationPoint } from './LocationPoint';
import GeometryMarker, { createGeometryMarker } from './GeometryMarker';


export interface CustomProjection{
    crs: L.CRS,
    transform: (location: LocationPoint) => LocationPoint
}

interface UseMapProps extends CustomProjection{
}

export default function useMap(props? : UseMapProps ) {
    
    const projection = props;
    const transform = projection?.transform || ((location: LocationPoint) => location);

    const maxZoom = useMemo(()=> {
        // @ts-ignore
        return projection ? projection.crs.options.resolutions.length - 2 : 18}, [projection?.crs.options.resolutions]);


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
                ...(projection === undefined ? {} : {
                    crs: projection.crs
                }),
                maxZoom: maxZoom , // Because of the bug

            });
            map.setView([50.018127619248084, 14.296341504868012], maxZoom/2);
            

            L.tileLayer.wms("https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/WMService.aspx", {
                layers: "GR_ORTFOTORGB",
                maxZoom : maxZoom, 
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

    // Add marker to the map and return it back
    const addMarker = ( marker: Marker) => {
        
        if(!mapRef.current) return marker;
        
        marker.attachMap(mapRef.current);
        setMarkers((m)=>[...m, marker])


        return marker;
    }
    
    // Add geometry to the map and return it back
    const addGeometry = (geometry: Geometry) => {
        if(!mapRef.current) return geometry;
        
        geometry.attachMap(mapRef.current);
        setGeometries((m)=>[...m, geometry])


        return geometry;
    }

    const createMarkerAndAdd = (latitude: number, longitude: number, marker: (marker: Marker, map: MapOptions)=>React.ReactElement) => {
        const loc = transform([latitude, longitude]);
        const m = createMarker(loc[0], loc[1], marker) ;
        addMarker( m);
        return m;
    }

    const createGeometryMarkerAndAdd = (points: LocationPoint[], marker: (marker: GeometryMarker, map: MapOptions)=>React.ReactElement) => {
        const m = createGeometryMarker([points.map((p)=>{
            const loc = transform(p);
            return [loc[0], loc[1]];
        })], marker) ;
        addMarker(m);
        return m;
    }
    const createGeometryAndAdd = (points: LocationPoint[]) => {
        
        const m = createGeometry([points.map((p)=>{
            const loc = transform(p);
            return [loc[0], loc[1]];
        })]) ;
        addGeometry( m);
        return m;
    }

    return {
        container,
        createMarker: createMarkerAndAdd,
        createGeometry: createGeometryAndAdd,
        createGeometryMarker: createGeometryMarkerAndAdd,
        addMarker,
        addGeometry,
        markers,
        geometries,
        projection,
        maxZoom,
        ref: ref as MapOptions
    }
}
