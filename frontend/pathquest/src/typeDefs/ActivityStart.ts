import Activity from "./Activity";

export interface ActivityStart extends Omit<Activity, "coords"> {}
