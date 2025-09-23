export default interface ServerActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
