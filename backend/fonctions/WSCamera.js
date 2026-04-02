import WebSocket from "ws";

export const createPythonWS = () => {
    const ws = new WebSocket("ws://localhost:8000/ws/stream");

    ws.on("open", () => {
        console.log("Connected to Python WS");
    });

    ws.on("error", (err) => {
        console.error("Python WS error:", err);
    });

    return ws;
};

export const demarrerStream = (clientWs) => {
    const pythonWs = createPythonWS();

    // Python → Front
    pythonWs.on("message", (data) => {
        if (clientWs.readyState === 1) {
            clientWs.send(data.toString());
        }
    });

    // Fermeture
    clientWs.on("close", () => {
        pythonWs.close();
    });

    pythonWs.on("close", () => {
        clientWs.close();
    });
};
