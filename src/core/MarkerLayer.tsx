import React, { useMemo } from 'react'
import Marker from './Marker';


export default class MarkerLayer{

    markers: Marker[] = [];
    layers: MarkerLayer[] = [];

    // Parent layer
    layer: MarkerLayer | undefined;

    isActive: boolean = true;
    constructor(){

    }

    
    setActive(isActive: boolean){
        this.isActive = isActive;
        
        this.markers.forEach((m)=>{
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

    addToLayer(layer: MarkerLayer){
        layer.layers.push(this);
        this.layer = layer;
    }
}
