import React, { useMemo } from 'react'
import Marker from './Marker';
import Geometry from './Geometry';
import ObjectInMap, { MapOptions } from './ObjectInMap';


export default class MarkerLayer extends ObjectInMap{
    constructor(map: MapOptions){
        super(map, "Layer")

        this.setActive(true, true);
    }

    add(marker: ObjectInMap | ObjectInMap[]){
        super.add(marker);
    }
    
}
