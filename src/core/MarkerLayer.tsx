import React, { useMemo } from 'react'
import Marker from './Marker';
import Geometry from './Geometry';


export default class MarkerLayer{

    markers: Marker[] = [];
    geometries: Geometry[] = [];
    layers: MarkerLayer[] = [];

    // Parent layer
    layer: MarkerLayer | undefined;

    isActive: boolean = true;

    protected map : L.Map | undefined;
    constructor(){

    }

    
    setActive(isActive: boolean){
        this.isActive = isActive;
        
        this.markers.forEach((m)=>{
            m.setActive(isActive);
        });
        this.geometries.forEach((m)=>{
            m.setActive(isActive);
        });

        this.layers.forEach((l)=>{
            l.setActive(isActive);
        })

        if(this.layer) this.layer._onChangeListener();
    }

    _onChangeListener(){

        // Loop over the children layers and check my own activity
        let allSame = true;
        let first = true;
        let lastIsActive : boolean = true;

        for(let i=0; i<this.layers.length; i++){
            const l = this.layers[i];
            if(!first && lastIsActive != l.isActive) allSame = false;
            first = false;
            lastIsActive = l.isActive;
        }

        if(!first && allSame) this.isActive = lastIsActive;
        
    }
    

    
    _addMarker(marker: Marker){
        this.markers.push(marker);
    }

    _addGeometry(geometry: Geometry){
        this.geometries.push(geometry);
    }

    addToLayer(layer: MarkerLayer){
        layer.layers.push(this);
        this.layer = layer;
    }

    _attachMap(map: L.Map){
        // Just beacuse of ClusterMarkerLayer
        // Can be stayed empty
        this.map = map;
    }

    _getLeafletObjectWhereToAdd() : any{
        if(!this.map){
            console.error("Cannot get leaflet object where to add - Map not attached to marker");
        }
        return this.map;
    }

}
