import { ActivityStart } from "./ActivityStart";

export default interface Activity extends ActivityStart {
    coords: [number, number][];
    vertProfile?: number[];
    distanceStream?: number[];
    timeStream?: number[];
    reprocessing: boolean;
}
