import { useState } from 'react';

const DiscoveredDevice = ({discoveredDevice}) => {
    const [added, setAdded] = useState(false);
    const [connected, setConnected] = useState(false);
    const [deviceId, setDeviceId] = useState(-1);
    const [deviceInfo, setDeviceInfo] = useState({});

    const handleAddDeviceClick = async(e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:8000/api/cmd/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                emitterType: "ble",
                address: discoveredDevice.address
            })
        });
        if (response.status === 200) {
            console.log("Device added!");
            const addResponse = await response.json();
            setAdded(true);
            setDeviceId(addResponse.deviceId);
        }
        else {
            console.error("Device add failed.");
        }
    }

    const handleConnectClick = async(e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:8000/api/ble/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: deviceId
            })
        });
        if (response.status === 200) {
            console.log("Device added!");
            const connectResponse = await response.json();
            setDeviceInfo(connectResponse);
            console.log(connectResponse);
            setConnected(true);
        }
        else {
            console.error("Device add failed.");
        }
    }

    return (
        <div className="discovered-device">
            <br/>
            {discoveredDevice.address} {discoveredDevice.name}
            <br/>RSSI: {discoveredDevice.rssi}
            <br/>avg: {discoveredDevice.rssiAverage}
            <br/>
            <button onClick={handleAddDeviceClick}>Add</button>
            { added ? <button onClick={handleConnectClick}>Connect</button> : ""}
        </div>
    );
}

export default DiscoveredDevice;