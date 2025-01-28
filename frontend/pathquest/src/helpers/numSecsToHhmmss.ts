const numSecsToHhmmss = (numSecs: number): string => {
    const hours = Math.floor(numSecs / 3600);
    const minutes = Math.floor((numSecs % 3600) / 60);
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const seconds = numSecs % 60;
    const paddedSeconds =
        seconds < 10 ? `0${Math.floor(seconds)}` : Math.floor(seconds);
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
};

export default numSecsToHhmmss;
