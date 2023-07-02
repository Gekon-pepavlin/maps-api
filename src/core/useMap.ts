import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
import Map from './Map'
import * as L from "leaflet"
import Marker, { createMarker } from './Marker'


export default function useMap() {
    const divRef = useRef(null);
  
    const mapRef = useRef<L.Map>(null);

    const markers : Marker[] = [];

    const container = useMemo(()=>Map(divRef), []);
    // Initialize map and set to the state
    useEffect(()=>{
        if(divRef.current === null){
            console.log("Div-reference is null");
            return;
        };
        try{
            const map = L.map(divRef.current, {zoomControl: false});
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

        }catch{} // Because map was creating twice on same div
    },[])

    const addMarker = ( marker: Marker) => {
        
        if(!mapRef.current) return marker;
        
        marker.attachMap(mapRef.current);
        markers.push(marker);


        return marker;
    }


    const createMarkerAndAdd = (latitude: number, longitude: number, marker: (marker: Marker, map: L.Map)=>React.ReactElement) => {
        const m = createMarker(latitude, longitude, marker) ;
        addMarker( m);
        return m;
    }

    return {
        container,
        createMarker: createMarkerAndAdd,
        addMarker
    }
}
