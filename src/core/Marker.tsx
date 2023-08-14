import L, { LatLngExpression } from 'leaflet';
import React from 'react'
import { renderToString } from 'react-dom/server';
import MarkerLayer from './MarkerLayer';
import ReactDOM from 'react-dom/client';
import { LocationPoint } from './LocationPoint';

export type MapOptions = L.Map;

export default class Marker{
    protected marker : L.Marker;

    location: LocationPoint;
    layer: MarkerLayer | undefined;

    map: MapOptions | undefined;

    isActive: boolean = false;

    // @ts-ignore
    htmlElement: HTMLElement;

    private reactElement: (marker: Marker, map: MapOptions)=>React.ReactElement;

    constructor(latitude: number, longitude: number, marker: (marker: Marker, map: MapOptions)=>React.ReactElement){
        this.reactElement = marker;
        const html = "<div>a</div>";

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
            htmlRoot.render(this.reactElement(this, this.map))

            // Disable click propagation to leaflet map
            L.DomEvent.disableClickPropagation(this.htmlElement);
        })

    }

    getLocation(){
        return this.location;
    }

    setLocation(location: LocationPoint){
        this.location = location;
        this.marker.setLatLng(this.location);
    }

    attachMap(map: MapOptions){
        this.map = map;
        this.setActive(true);
    }

    addToLayer(layer: MarkerLayer){
        if(!this.map){
            console.error("Cannot add to layer - Map not attached to marker");
            return;
        }
        this.layer = layer;
        layer._attachMap(this.map);
        layer._addMarker(this);
        this.setActive(true, true);

    }

    setActive(isActive: boolean, force: boolean = false){
        if(!force && isActive === this.isActive) return;
        this.isActive = isActive;

        if(this.layer) this.layer._onChangeListener();
        
        if(!this.map) return;

        const parent = this.layer?._getLeafletObjectWhereToAdd() || this.map;
        if( this.isActive ){
            this.marker.addTo(parent);
            
        }
        else this.marker.removeFrom(parent)

    }

    getLeafletMarker(){
        return this.marker;
    }

    

}

export function createMarker(latitude: number, longitude: number, marker: (marker: Marker, map: MapOptions)=>React.ReactElement){
    return new Marker(latitude, longitude, marker);
}