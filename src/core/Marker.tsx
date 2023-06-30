import L from 'leaflet';
import React from 'react'
import { renderToString } from 'react-dom/server';
import MarkerLayer from './MarkerLayer';

export default class Marker{
    marker : L.Marker;

    layer: MarkerLayer | undefined;

    map: L.Map | undefined;

    isActive: boolean = false;

    constructor(latitude: number, longitude: number, marker: React.ReactElement){
        const html = renderToString(marker);

        const size = 40;
        const icon  = L.divIcon({
            className: "marker-div",
            html,
            iconSize: [size,size],
            iconAnchor: [0,0]
        }); 
        this.marker = L.marker([latitude, longitude], {icon});

    }

    attachMap(map: L.Map){
        this.map = map;
        this.setActive(true);
    }

    addToLayer(layer: MarkerLayer){

        layer._addMarker(this);
        this.layer = layer;
    }

    setActive(isActive: boolean){
        if(isActive === this.isActive) return;
        this.isActive = isActive;

        if(this.layer) this.layer._onChangeListener();
        
        if(!this.map) return;

        if( this.isActive ) this.marker.addTo( this.map );
        else this.marker.removeFrom( this.map )

    }

}

export function createMarker(latitude: number, longitude: number, marker: React.ReactElement){
    return new Marker(latitude, longitude, marker);
}