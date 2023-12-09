import React, { useMemo } from 'react'
import Marker from './Marker';
import Geometry from './Geometry';
import ObjectInMap, { MapOptions, ObjectInMapProps } from './ObjectInMap';


export default class MarkerLayer extends ObjectInMap{
    constructor(map: MapOptions, options?: Partial<ObjectInMapProps>){
        super(map, "Layer", options)

        this.setActive(true, true);
    }

    add(marker: ObjectInMap | ObjectInMap[]){
        super.add(marker);
    }
    
}
