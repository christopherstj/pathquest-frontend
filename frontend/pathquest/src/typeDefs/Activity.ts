import { ActivityStart } from "./ActivityStart";

export default interface Activity extends ActivityStart {
    coords: string | [number, number][];
    vertProfile: string | number[];
    distanceStream: string | number[];
}
