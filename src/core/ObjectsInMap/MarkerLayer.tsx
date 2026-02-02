import { MapOptions, ObjectInMap, ObjectInMapProps } from "./ObjectInMap";

export class MarkerLayer extends ObjectInMap {
    constructor(map: MapOptions, options?: Partial<ObjectInMapProps>) {
        super(map, "Layer", options);

        this.setActive(true, true);
    }

    add(marker: ObjectInMap | ObjectInMap[]) {
        super.add(marker);
    }
}
