import Peak from "./Peak";

export default interface UnclimbedPeak extends Peak {
    distance?: number;
    isFavorited: boolean;
    isSummitted?: boolean;
}
