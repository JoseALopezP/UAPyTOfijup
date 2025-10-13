export default function updateRealTimeFunction() {
    return new Date(Date.now()).toLocaleTimeString("es-AR", {
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
    });
}

