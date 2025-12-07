export default interface ServerActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
