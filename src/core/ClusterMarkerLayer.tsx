import 'leaflet.markercluster';
import MapObject, { MapOptions } from "./MapObject";
import MarkerLayer from './MarkerLayer';
import Marker from './Marker';
import { useMemo } from 'react';
import { v4 as uuid } from 'uuid';


type GroupsDict = Record<number, Record<number, Group>>;

interface Group{
    x: number;
    y: number;
    zoom: number;
    objects: MapObject[];
    groupsDict: GroupsDict;
    groups: Group[];
}

interface ClusterData{
    startZoom: number;
    endZoom: number;
    clusters: ClusterData[];
    objects: MapObject[];
}

class Cluster{
    id: string;

    map: MapOptions;
    radius: number;
    startZoom: number;
    endZoom: number;
    objects: MapObject[];
    clusters: Cluster[] = [];
    parentCluster?: Cluster;

    allSubObjectsCount: number;


    private marker: Marker = undefined as any;
    markerLayer: MarkerLayer = undefined as any;

    private reactElement: (count:number)=>React.ReactElement;

    private _onRelase?: ()=>void;

    constructor(
        map: MapOptions,
        radiusInPixels: number,
        startZoom: number,
        endZoom: number,
        objects: MapObject[],
        clustersData: ClusterData[],
        reactElement: (count:number)=>React.ReactElement,
        parentCluster?: Cluster
    ){
        this.id = uuid();

        this.map = map;
        this.radius = radiusInPixels;
        this.startZoom = startZoom;
        this.endZoom = endZoom;
        this.objects = objects;
        this.parentCluster = parentCluster;

        this.reactElement = reactElement;

        this.clusters = clustersData.map((data) => createCluster(data, map, radiusInPixels, reactElement, this));
        
        this.allSubObjectsCount = objects.length + this.clusters.reduce((acc, cluster)=>acc + cluster.allSubObjectsCount, 0);
        
        

    }

    public initialize(){

        this.markerLayer = new MarkerLayer(this.map);
        
        this.marker = new Marker(0,0,()=>{
            return this.reactElement(this.allSubObjectsCount)
        }, this.map)


        this.objects.forEach((object)=>{
            this.markerLayer.add(object);
        })

        this.parentCluster?.markerLayer.add(this.marker);





        const onZoomEnd = () =>{
            this.redisplay()
        }
        this.map.on("zoomend", onZoomEnd)

        const onLocationChange = () =>{
            this.marker.setLocation(this.markerLayer.getLocation());
        }
        this.markerLayer.addListener("locationchange", onLocationChange)
        this.marker.setLocation(this.markerLayer.getLocation());


        this.redisplay()


        this._onRelase = () => {
            // console.log("Releasing cluster with id:", this.id)
            this.map.off("zoomend", onZoomEnd)
            this.markerLayer.removeListener("locationchange", onLocationChange)
            this.marker.delete();

        }

        this.clusters.forEach((cluster)=>{
            cluster.initialize();
        });
    }
    
    private redisplay(){
        // console.log("Redisplaying cluster with zoom:", this.map.getZoom())
        this._display(this.map.getZoom());
    }

    private _display(zoom: number){
        // console.log(this.startZoom, this.endZoom)
        if (zoom >= this.startZoom && zoom <= this.endZoom && this.clusters.length>0){
            this.marker.setActive(true);

        }else{
            this.marker.setActive(false);

        }

        

        if(zoom >= this.startZoom){
            this.objects.forEach((o)=>{
                o.setActive(true);
            })
        }else{
            this.objects.forEach((o)=>{
                o.setActive(false);
            })
        }
        
    }

    


    // Use for clean up before deleting
    release(){
        this.clusters.forEach((cluster)=>{
            cluster.release();
        });

        this._onRelase?.();

    }

    getTotalSubclustersCount(){
        let count = 0;
        this.clusters.forEach((cluster)=>{
            count += cluster.getTotalSubclustersCount();
        })
        return count + this.clusters.length;
    }

    log() : any{
        const data = {
            id: this.id,
            zoom: [this.startZoom, this.endZoom],

        }
        return this.clusters.length>0 ? 
        {
            ...data,
            clusters: this.clusters.map((cluster)=>cluster.log()),
            subclustersCount: this.getTotalSubclustersCount()
        }
        :
        {
            ...data,
            objects: this.objects.map((object)=>object.id)
        }
        
    }
}

function createCluster(data: ClusterData, map: MapOptions, radiusInPixels: number, 
        reactElement: (count:number)=>React.ReactElement,parentCluster?: Cluster){
    const cluster =  new Cluster(
        map,
        radiusInPixels,
        data.startZoom,
        data.endZoom,
        data.objects,
        data.clusters,
        reactElement,
        parentCluster
    )

    return cluster;
}

export default class ClusterMarkerLayer extends MapObject{
    protected clusterReactElement: (count:number)=>React.ReactElement;

    private radius: number;


    private mainClusters: Cluster[] = [];

    private objects: MapObject[] = [];
    

    constructor(reactElement: (count:number)=>React.ReactElement, map: MapOptions, radiusInPixels: number = 200){
        super(map,"ClusterLayer");

        this.clusterReactElement = reactElement;
        this.radius = radiusInPixels;

    }


    add(marker: MapObject){
        super.add(marker);

        this.objects.push(marker);

        this._set(this.objects);


    }

    private _set(markers: MapObject[]){
        const clusters = this._splitToClusters(markers);


        this.mainClusters.forEach((cluster)=>{
            cluster.release();
        });

        this.mainClusters = clusters.map((data) => createCluster(data, this.map, this.radius, this.clusterReactElement));
        this.mainClusters.forEach((cluster)=>{
            cluster.initialize();
            super.add(cluster.markerLayer);
        });



    }

    private _splitToClusters(markers: MapObject[]) : ClusterData[]{
        


        const groupsDict : GroupsDict = [];
        const groups : Group[] = [];
        const min = this.map.getMinZoom();
        const max = this.map.getMaxZoom();
        markers.forEach((marker)=>{
            let lastGroup : Group | undefined;

            for(let i = min; i <= max; i++){
                const [x,y] = this._getClusterIndexes(marker, i);

                const parentGroups = lastGroup ? (lastGroup as Group).groupsDict : groupsDict;

                if(!parentGroups[x]) parentGroups[x] = {};
                if(!parentGroups[x][y]) parentGroups[x][y] = {
                    x, y, zoom: i,
                    objects: [],
                    groupsDict: {},
                    groups: []
                };

                const currentGroup : Group = parentGroups[x][y];
                if(lastGroup && lastGroup.groups.indexOf(currentGroup) < 0) lastGroup.groups.push(currentGroup);
                if(!lastGroup && groups.indexOf(currentGroup) < 0) groups.push(currentGroup);


                if(i === max)
                    currentGroup.objects.push(marker);

                lastGroup = currentGroup;

            

            }


        });


        return groups.map((group)=>{
            return this._simplifyGroup(group);
        });
    }

    private _simplifyGroup(group: Group) : ClusterData{

        const cluster : ClusterData = {
            startZoom: group.zoom,
            endZoom: group.zoom,
            clusters: [],
            objects: group.objects
        }

        const clusters = group.groups.map((group)=>{
            return this._simplifyGroup(group);
        });

        if(clusters.length === 1){
            cluster.endZoom = clusters[0].endZoom;
            cluster.clusters = clusters[0].clusters;
            cluster.objects = [...cluster.objects, ...clusters[0].objects];
        }
        if(clusters.length > 1)
            cluster.clusters = clusters;
        


        return cluster;
    }

    private _getClusterIndexes(object: MapObject, zoom: number) : [number, number]{
        const point = this.map.project(object.getLocation(),zoom);
        const clusterXIndex = Math.floor(point.x / this.radius);
        const clusterYIndex = Math.floor(point.y / this.radius);
        return [clusterXIndex, clusterYIndex]
    }



}