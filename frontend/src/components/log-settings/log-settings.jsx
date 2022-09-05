import { useState } from 'react';

const LogSettings = () => {
    const [logLevel, setLogLevel] = useState("disabled");
    const [logStreamWs, setLogStreamWs] = useState(null);

    const handleChange = async (event) => {

        /* log level has changed */
        if (event.target.value !== "disabled") {

            const response = await fetch('http://localhost:8000/api/dev/logStreamSettings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: event.target.value
                })
            });

            if (response.status !== 200) {
                console.error("Log stream level setting failed.");
                return;
            }

            /* transition from websocket disabled to on */
            if (logLevel === "disabled") {
                if (logStreamWs !== null) {
                    logStreamWs.close(1000);
                    console.error("Websocket remained open while in disabled state.")
                }

                const newLogStreamWs = new WebSocket('ws://localhost:8000/api/ws/log')
                newLogStreamWs.onmessage = async (message) => {
                    console.log(message.data);
                }

                setLogStreamWs(newLogStreamWs);
            }

            setLogLevel(event.target.value);
        }
        /* log stream was disabled */
        else {
            logStreamWs.close(1000);
            setLogStreamWs(null);
            setLogLevel(event.target.value);
        }
    }

    return (
        <div className="LogSettings">
            <select onChange={handleChange}>
                <option value="disabled">Disabled</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
            </select>
        </div>
    );
}

export default LogSettings;