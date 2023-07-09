import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
import Map from './Map'
import * as L from "leaflet"
import Marker, { MapOptions, createMarker } from './Marker'
import Geometry, { createGeometry } from './Geometry';


export default function useMap() {
    const divRef = useRef(null);
  
    const mapRef = useRef<MapOptions>(null);

    const [ref, setRef] = useState<MapOptions>();

    const [markers, setMarkers] = useState<Marker[]>([]);
    const [geometries, setGeometries] = useState<Geometry[]>([]);

    const container = useMemo(()=>Map(divRef), []);

    const proj = {
        name: "EPSG:5514",
        alias:"+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs"
    };
    // Initialize map and set to the state
    useEffect(()=>{
        if(divRef.current === null){
            console.log("Div-reference is null");
            return;
        };
        try{
            var crs = new L.Proj.CRS(proj.name, proj.alias,{
                origin: [-951499.37, -930499.37],
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
                  0.298582153289307
                ]
            });

            const map = L.map(divRef.current, {
                zoomControl: false,
                crs: crs
            
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

        }catch{} // Because map was creating twice on same div
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
        proj,
        ref: ref as MapOptions
    }
}
