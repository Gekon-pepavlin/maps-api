import L from "leaflet";
import { LocationPoint } from "./LocationPoint";
import Marker from "./ObjectsInMap/Marker";
import { MapOptions } from "./ObjectsInMap/ObjectInMap";
import Geometry, { GeometryType } from "./ObjectsInMap/Geometry";
import GeometryMarker from "./ObjectsInMap/GeometryMarker";
import MarkerLayer from "./ObjectsInMap/MarkerLayer";
import ClusterMarkerLayer, { ClusterMarkerLayerProps } from "./ObjectsInMap/ClusterMarkerLayer";
import { MapObjectProps, defaultMapObjectProps } from "./MapObjectProps";

export default class MapObject{
    private projection: L.CRS;
    private transform: (location: LocationPoint) => LocationPoint;
    private maxZoom : number;

    private props: MapObjectProps;

    private callbacks: Partial<MapObjectCallbacks>[] = [];
    private notAddedCallbacks: Partial<MapObjectCallbacks>[] = [];

    initialized = false;
    public map: L.Map = undefined as any;
    constructor(props: MapObjectProps){
        this.projection = props.projection.crs;
        this.transform = props.projection.transform;
        // @ts-ignore
        this.maxZoom = this.projection.options.resolutions.length - 2;

        this.props = props;
    }


    public addListener(event: Partial<MapObjectCallbacks>){

        if(!this.map){
            this.notAddedCallbacks.push(event);
            return;
        }else{
            this.callbacks.push(event);
        }
        this.map.on("zoomend", ()=>{
            this.callbacks.forEach(element => {
                element.onZoomChange?.(this.map.getZoom());
            });
            
        })

    }

    public removeListener(event: Partial<MapObjectCallbacks>){
        this.callbacks = this.callbacks.filter((e)=>e !== event);


    }

    private initialize(htmlElement: HTMLElement, callbacks: Partial<MapObjectCallbacks>){
        try{
            const newMap = L.map(htmlElement, {
                zoomControl: false,
                crs: this.projection,
                maxZoom: this.maxZoom , // Because of the bug
    
            });
            newMap.setView([50.018127619248084, 14.296341504868012], this.maxZoom/2);
            
    
            L.tileLayer.wms("https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/WMService.aspx", {
                layers: "GR_ORTFOTORGB",
                maxZoom : this.maxZoom, 
                styles: "",
                format: "image/png",
                transparent: true,
                version: "1.3.0",
                attribution: "ČÚZK"
            }).addTo(newMap);

            this.map = newMap;
        }catch(e){
            console.error(e);
        }

        if(this.props.showMapScale){
            L.control.scale({
                imperial: false,
                maxWidth: 100,
              }).addTo(this.map);
        }

        this.initialized = true;

        this.initializeCallbacks(callbacks);

    }
    private initializeCallbacks(callbacks: Partial<MapObjectCallbacks>){
        
        this.addListener(callbacks);

        this.notAddedCallbacks.forEach((e)=>{
            this.addListener(e);
        })
        this.notAddedCallbacks = [];
        
        this.callbacks.forEach(element => {
            element.onLoad?.(this);
        });
    }

    private checkIfInitialized(){
        if(!this.initialized){
            throw new Error("Map is not initialized yet. Try to use useMap.");
        }
    }


    createMarker = (location: LocationPoint, marker: (marker: Marker, map: MapOptions)=>React.ReactElement) => {
        this.checkIfInitialized();

        const loc = this.transform(location);
        const m = new Marker(loc[0], loc[1], marker, this.map) ;
        return m;
    }

    createGeometry = (points: LocationPoint[][], type : GeometryType) => {
        this.checkIfInitialized();

        const m = new Geometry(points.map((p)=>{
            return p.map((p)=>{
                const loc = this.transform(p);
                return [loc[0], loc[1]];
            })
        }), type, this.map);
        return m;
    }

    createGeometryMarker = (points: LocationPoint[][], type: GeometryType, marker: (marker: GeometryMarker, map: MapOptions)=>React.ReactElement) => {
        this.checkIfInitialized();
        const m = new GeometryMarker(points.map((p)=>{
            return p.map((p)=>{
                const loc = this.transform(p);
                return [loc[0], loc[1]];
            })
        }), type, marker, this.map) ;
        return m;
    }

    createLayer = () => {
        this.checkIfInitialized();
        const l = new MarkerLayer(this.map);
        return l;

    }

    createClusterLayer = (element: (count: number)=>React.ReactElement, options?: Partial<ClusterMarkerLayerProps>) => {
        this.checkIfInitialized();
        const l = new ClusterMarkerLayer(element, this.map, options);
        return l;
    }
}

export interface MapObjectCallbacks{
    onLoad: (map: MapObject)=>void,
    onZoomChange: (zoom: number)=>void,

}


export function createMap(props: Partial<MapObjectProps>) : MapObject{
    const propsWithDefaults = {
        ...defaultMapObjectProps,
        ...props,
    }
    return new MapObject(propsWithDefaults);
}