import { v4 as uuid } from 'uuid';
import { LocationPoint } from '../LocationPoint';
import { defaultMapObjectProps } from '../MapObjectProps';

export type MapOptions = L.Map;

export interface ObjectInMapProps{
    useAverageLocation: boolean;
}

const defaultObjectInMapProps: ObjectInMapProps = {
    useAverageLocation: true
}

type EventName = "activechange" | "childrenchange" | "locationchange"
                | "click" | "mouseover" | "mouseleave";
export default class ObjectInMap{
    name: string;
    id: string;


    parent: ObjectInMap | undefined;
    protected children: ObjectInMap[] = [];
    protected location: LocationPoint;

    protected useAverageLocation: boolean;

    map: MapOptions;

    isActive: boolean = true;
    isInitialized: boolean = false;


    private eventCallbacks: Record<string, ((e: any)=>void)[]> = {};


    get hasParent(){
        return this.parent !== undefined
    }
    
    private dontForgetTimeout: NodeJS.Timeout | undefined;

    constructor(map: MapOptions, name: string = "MapObject", options? : Partial<ObjectInMapProps>){

        const props : ObjectInMapProps = {...defaultObjectInMapProps, ...options};
        this.useAverageLocation = props.useAverageLocation;

        this.name = name;
        this.id = uuid();

        // Attach map
        this.map = map;
        this.setMap(map);




        this.location = [0,0];

        this.setDontForgetTimeout();
        
    }

    private setDontForgetTimeout(){
        this.dontForgetTimeout = setTimeout(()=>{
            if(!this.isInitialized) 
                console.warn("Don't forget to call initialize() on", this.name, "object. \n" +
                "It's possible that it contains children that are not initialized yet.")
        }, 5000)
    }

    toString(){
        return this.name
    }

    getLocation(){
        return this.location;
    }

    setLocation(location: LocationPoint){
        if(this.location[0] === location[0] && this.location[1] === location[1]) return;
        
        this.location = location
        this.callEventCallback("locationchange", this.location);
        this.parent?.recalculateLocation();
    }

    protected setMap(map: L.Map){
        this.map = map;
    }
    protected add(child: ObjectInMap | ObjectInMap[]){
        if(child instanceof Array){
            child.forEach( (c)=>{
                this._add(c);
            })
        }else{
            this._add(child);
        }
    }
    private _add(child: ObjectInMap){
        if(this.isInitialized && !child.isInitialized){
            this.isInitialized = false;
            this.setDontForgetTimeout();
        }
        this.children.push(child);
        child._setParent(this);

        this.recalculateLocation()
        this.callEventCallback("childrenchange", this.children);

    }
    protected remove(child: ObjectInMap){
        const index = this.children.indexOf(child);
        if(index>=0){
            this.children[index].parent = undefined
            // remove from array
            this.children.splice(index, 1);

        }else{
            console.log("Child not found.")
        }

        this.recalculateLocation()
        this.callEventCallback("childrenchange", this.children);

    }

    protected recalculateLocation(children?: LocationPoint[]){
        if(!children) children = this.children.map( (child)=>{
            return child.getLocation();
        });
        if(children.length==0) return;

        if(!this.useAverageLocation){
            const middleObject = children[Math.floor(children.length/2)];
            const location = middleObject;
            this.setLocation(location);
            return;
        }

        let sum = {lat: 0, lng: 0};

        children.forEach( (location: LocationPoint)=>{
            sum.lat += location[0];
            sum.lng += location[1];
        }
        );
        sum.lat = sum.lat / children.length;
        sum.lng = sum.lng / children.length;

        const finalLocation = [sum.lat, sum.lng];

        if(this.location[0] === finalLocation[0] && this.location[1] === finalLocation[1]) return;

        this.setLocation([sum.lat, sum.lng]);
    }

    private _setParent(parent?: ObjectInMap){
        if(!parent){
            console.log("Parent is undefined");
            return;
        }

        else if(this.parent === parent){
            return;
        }
        
        else if(this.hasParent){
            this.parent?.remove(this)
        }

        clearTimeout(this.dontForgetTimeout);

        this.parent = parent;
        this.parent.setMap(this.map);
    }
    protected setParent(parent?: ObjectInMap){
        this._setParent(parent);

        if(!this.parent){
            console.log("Parent is undefined");
            return;
        }

        this.parent.add(this);
    }

    addListener(event: EventName, callback: (e: any)=>void, callOnAdd: boolean = false){
        if(!this.eventCallbacks[event]) this.eventCallbacks[event] = [];
        this.eventCallbacks[event].push(callback);

        if(callOnAdd) this.callEventCallback(event, null);
    }

    callEventCallback(event: EventName, e: any){
        if(!this.eventCallbacks[event]) return;
        this.eventCallbacks[event].forEach( (callback)=>{
            callback(e);
        })
    }



    setActive(isActive: boolean, force: boolean = false, ignoreChildren = false) : any{
        if(!this.map){
            console.log("Cannot change active property because map is not attached");
            return;
        };
        if(!force && isActive === this.isActive) return;
        this.isActive = isActive;

        if(!ignoreChildren){
            this.children.forEach( (child)=>{
                child.setActive(isActive, force);
            });
        }

        if(this.hasParent) this.parent?.onChildrenActiveChange();

        this.callEventCallback("activechange", this.isActive);
        return true;
    }

    removeListener(event: EventName, callback: (e: any)=>void){
        if(!this.eventCallbacks[event]) return;

        const index = this.eventCallbacks[event].indexOf(callback);
        if(index>=0){
            this.eventCallbacks[event].splice(index, 1);
        }
    }


    
    protected onChildrenActiveChange(){
        let allSame = true;
        let first = true;
        let lastIsActive : boolean = true;

        for(let i=0; i<this.children.length; i++){
            const l = this.children[i];


            if(!first && lastIsActive != l.isActive) allSame = false;

            first = false;
            lastIsActive = l.isActive;
        }

        if(!first && allSame) this.setActive(lastIsActive)
        
    }

    initialize(){
        const inMap = this.isInitialized;

        this.children.forEach( (child)=>{
            if(!child.isInitialized) child.initialize();
        });

        clearTimeout(this.dontForgetTimeout);

        this.isInitialized = true;
        // return inMap !== this.isInitialized;
        return this;
    }
    delete(){
        if(this.hasParent) this.parent?.remove(this);
        this.children.forEach( (child)=>{
            child.delete();
        })
        this.isInitialized = false;
    }

    setUseAverageLocation(useAverageLocation: boolean){
        this.useAverageLocation = useAverageLocation;
        this.recalculateLocation();
    }
}