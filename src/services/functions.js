function convertTimeFormate(dateString, type = 'dateTime') {
    const isoDate = "2025-04-25T14:00:00.000Z";
    const date = new Date(isoDate);
    let formatted = null;
    if (type === 'time') {
        formatted = date.toTimeString().slice(0, 5);
    } else {
        formatted = date.toISOString().slice(0, 16);
    }
    return formatted
}
function secondsToHHMM(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    // Pad with leading zero if needed
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    return `${hh}:${mm}`;
}
module.exports = { convertTimeFormate, secondsToHHMM };