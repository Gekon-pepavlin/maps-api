import React from "react";
import { LocationPoint } from "../LocationPoint";
import { MapOptions, ObjectInMapProps } from "./ObjectInMap";
import { GeometryMarker } from "./GeometryMarker";

export type GeometryType = "polygon" | "line";

export class Geometry extends GeometryMarker {
    constructor(
        points: LocationPoint[][],
        type: GeometryType,
        map: MapOptions,
        name: string = "Geometry",
        options?: Partial<ObjectInMapProps>
    ) {
        super(points, type, () => <></>, map, name, options);
    }
}
