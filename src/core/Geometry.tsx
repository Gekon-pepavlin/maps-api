import L, { LatLngExpression } from "leaflet";
import { MapOptions } from "./Marker";
import MarkerLayer from "./MarkerLayer";


export default class Geometry{

    map: MapOptions | undefined;
    layer: MarkerLayer | undefined;
    isActive: boolean = false;

    private htmlElement: HTMLElement| undefined;

    private polygon: L.Polygon;
    
    constructor( points: LatLngExpression[]){
        this.polygon = L.polygon(points);
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
            // @ts-ignore
            this.htmlElement = this.polygon._path;
            this.htmlElement?.setAttribute("pointer-events", "auto");
            
        }
        else this.polygon.removeFrom( this.map )

    }

    addEvent(name: "click" | "dblclick" | "mousedown" | "mouseup" | "mouseover" | "mouseout" | "mousemove" | "contextmenu" | "preclick", 
        func: (geometry: Geometry, map: MapOptions)=>any){
        this.polygon.on(name, ()=>{
            if(!this.map) return;
            func(this, this.map);
        });

        return this;
    }

    getHtmlElement(){
        return this.htmlElement as HTMLElement;
    }

    getPolygon(){
        return this.polygon;
    }

    setStyle(style: L.PathOptions){
        this.polygon.setStyle(style);
    }
}

export function createGeometry(points: LatLngExpression[]){
    return new Geometry(points);
}