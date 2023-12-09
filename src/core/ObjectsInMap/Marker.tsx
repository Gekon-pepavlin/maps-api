import L, { LatLngExpression } from 'leaflet';
import React, { useEffect } from 'react'
import { renderToString } from 'react-dom/server';
import MarkerLayer from './MarkerLayer';
import ReactDOM from 'react-dom/client';
import { LocationPoint } from '../LocationPoint';
import ObjectInMap, { MapOptions, ObjectInMapProps } from './ObjectInMap';

const MarkerContainer = ({marker, map, element}:{marker: Marker, map: MapOptions, element: (marker:Marker, map:MapOptions)=>React.ReactElement}) => {
    const [visible, setVisible] = React.useState(marker.isActive);

    const onClick = (e: any) => {
        e.stopPropagation();
        marker.callEventCallback("click", e);
    }

    const onMouseOver = (e: any) => {
        e.stopPropagation();
        marker.callEventCallback("mouseover", e);
    }

    const onMouseLeave = (e: any) => {
        e.stopPropagation();
        marker.callEventCallback("mouseleave", e);
    }

    useEffect(()=>{
        marker.addListener("activechange", ()=>{
            setVisible(marker.isActive);
        }, true)


    },[]);

    return <div style={{position: "absolute", display: visible?"block":"none"}} 
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}>
        {element(marker, map)}
    </div>
}

export default class Marker extends ObjectInMap{
    protected marker : L.Marker;
    location: LocationPoint;
    isActive: boolean = false;

    // @ts-ignore
    htmlElement: HTMLElement;

    protected reactElement: (marker: Marker, map: MapOptions)=>React.ReactElement;

    constructor(latitude: number, longitude: number, marker: (marker: Marker, map: MapOptions)=>React.ReactElement, 
        map: MapOptions, name: string = "Marker", options?: Partial<ObjectInMapProps>){
        super(map, name, options);
        this.reactElement = marker;
        const html = "<div></div>";
        
        const size = 0;
        const icon  = L.divIcon({
            className: "marker-div",
            html,
            iconSize: [size,size],
            iconAnchor: [0,0]
        }); 
        
        this.location = [latitude, longitude];
        this.marker = L.marker([latitude, longitude], {icon});
        this.marker.on("add", (e)=>{
            if(!this.map){
                console.error("Cannot continue in add callback - Map not attached to marker");
                return;
            }
            const htmlElement = e.target._icon;
            this.htmlElement = htmlElement;

            
            const htmlRoot = ReactDOM.createRoot(htmlElement);
            htmlRoot.render(<MarkerContainer marker={this} map={this.map} element={this.reactElement}/>)

            // Disable click propagation to leaflet map
            L.DomEvent.disableClickPropagation(this.htmlElement);
            
        })

        this.setActive(true);

    }



    setLocation(location: LocationPoint){
        super.setLocation(location);
        this.marker.setLatLng(this.location);
    }

    getLeafletMarker(){
        return this.marker;
    }

    addToLayer(layer?: MarkerLayer){
        super.setParent(layer);
    }

    initialize() {
        const added = super.initialize();

        this.marker.addTo(this.map);
        

        return this;
    }

    delete(): void {
        super.delete();
        
        this.marker.remove();
    }

    

    

}
