import L from "leaflet";
import { LocationPoint } from "./LocationPoint";
import Marker from "./Marker";

export default class GeometryMarker extends Marker{
    polygon: L.Polygon;

    // @ts-ignore
    svgPathHtmlElement: HTMLElement;

    private points: LocationPoint[][] = [];
    
    constructor( points: LocationPoint[][], marker: (marker: GeometryMarker, map: any)=>React.ReactElement){
        super(0,0, marker as (marker: Marker, map: any)=>React.ReactElement);
        this.polygon = L.polygon(points);       
        this.points = points; 
    }

    setActive(isActive: boolean){
        if(isActive === this.isActive) return;
        this.isActive = isActive;

        if(!this.map) return;
        if( this.isActive ){
            this.polygon.addTo( this.map );   
            
            // @ts-ignore
            this.svgPathHtmlElement = this.polygon._path;
            this.svgPathHtmlElement.setAttribute("pointer-events", "auto");

            
            // Disable click propagation to leaflet map
            this.polygon.on("click", (e: any)=>{
                L.DomEvent.disableClickPropagation(e.target);
            });


        }else{
            this.polygon.removeFrom( this.map );
        }

        super.setActive(isActive, true);


        if(this.isActive){
            // Save and set the center of the polygon   
            
            let sum = {lat: 0, lng: 0};
            const flatten = this.points.flat();
            flatten.forEach( (point: LocationPoint)=>{
                sum.lat += point[0];
                sum.lng += point[1];
            });
            sum.lat = sum.lat / flatten.length;
            sum.lng = sum.lng / flatten.length;
            const center = sum;
            this.marker.setLatLng(center);
            this.location = [center.lat, center.lng];  
        
        }
        
    }
}

export function createGeometryMarker( points: LocationPoint[][], marker: (marker: GeometryMarker, map: any)=>React.ReactElement){
    return new GeometryMarker(points, marker);
}