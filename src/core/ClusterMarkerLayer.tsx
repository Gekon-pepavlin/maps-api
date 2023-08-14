import L from "leaflet";
import 'leaflet.markercluster';
import MarkerLayer from "./MarkerLayer";
import Marker, { MapOptions } from "./Marker";
import "leaflet.markercluster/dist/MarkerCluster.css";

export default class ClusterMarkerLayer extends MarkerLayer{
    private clusterGroup : L.MarkerClusterGroup;

    constructor(graphics: ()=>React.ReactElement, pixelsRadius: number = 25){
        super();
        this.clusterGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            animate: false,
            maxClusterRadius: pixelsRadius,
            iconCreateFunction: function (cluster) {
                var markers = cluster.getAllChildMarkers();
                const html = `<div style="background-color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center">${cluster.getChildCount()}</div>`;
                const size = 20;
                const icon  = L.divIcon({
                    className: "marker-div",
                    html,
                    iconSize: [size,size],
                    iconAnchor: [0,0]
                }); 
                return icon;
            }
        })
        this.clusterGroup.on("clusterclick", (e)=>{
            console.log("baf",e);
        })
    }

    _addMarker(marker: Marker): void {
        if(!this.map){
            console.error("Map not attached to cluster layer");
            return;
        }
        

        super._addMarker(marker);

        this.clusterGroup.addLayer(marker.getLeafletMarker());
        this.clusterGroup.addTo(this.map);
    }

    _attachMap(map: L.Map): void {
        if(!map){
            console.error("Cannot attach undefined map to cluster layer");
        }
        this.map = map;
        this.clusterGroup.addTo(map);
    }

    _getLeafletObjectWhereToAdd(){
        return this.clusterGroup;
    }

}