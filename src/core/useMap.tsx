import MapContainer, { MapProps } from './MapContainer'
import {} from "proj4leaflet"
import MapObject, { MapObjectCallbacks } from './MapObject';
import { useMemo, useRef } from 'react';




export default function useMap(mapObject: MapObject, callbacks?: Partial<MapObjectCallbacks>) 
    : [(props: MapProps)=>JSX.Element, MapObject] {
    

    const ref = useRef(null);
    const container = useMemo(()=>MapContainer(ref,(e)=>{
        //@ts-ignore
        mapObject.initialize(e, callbacks || {});
    }),[]);
  
    return [container, mapObject]

}
