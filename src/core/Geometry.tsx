import L, { LatLngExpression } from "leaflet";
import { MapOptions } from "./Marker";
import MarkerLayer from "./MarkerLayer";


export default class Geometry{

    map: MapOptions | undefined;
    layer: MarkerLayer | undefined;
    isActive: boolean = false;

    private polygon: L.Polygon;
    
    constructor( points: LatLngExpression[]){
        this.polygon = L.polygon(points, {color:"red"});
    }

    attachMap(map: MapOptions){
        this.map = map;
        this.setActive(true);
    }

    addToLayer(layer: MarkerLayer){

        layer._addGeometry(this);
        this.layer = layer;
    }

    setActive(isActive: boolean){
        if(isActive === this.isActive) return;
        this.isActive = isActive;

        if(this.layer) this.layer._onChangeListener();
        
        if(!this.map) return;

        if( this.isActive ){
            this.polygon.addTo( this.map );
            
        }
        else this.polygon.removeFrom( this.map )

    }
}

export function createGeometry(points: LatLngExpression[]){
    return new Geometry(points);
}