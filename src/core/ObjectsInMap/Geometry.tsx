import React from "react";
import { LocationPoint } from "../LocationPoint";
import { MapOptions } from "./ObjectInMap";
import GeometryMarker from "./GeometryMarker";

export type GeometryType = "polygon" | "line";

export default class Geometry extends GeometryMarker{

    constructor(points: LocationPoint[][], type: GeometryType, map: MapOptions){
        super(points, type, ()=><></>, map, "Geometry")
    }
}
