import Peak from "./Peak";

export interface UserPeakWithSummitCount extends Peak {
    summit_count: number;
    first_summit_date?: string;
    last_summit_date?: string;
}

export default UserPeakWithSummitCount;

