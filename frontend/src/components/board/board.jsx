import { useState, useEffect } from 'react';
import { useContext  } from 'use-context-selector';
import { FunctionBox } from 'components';
import { DiscoveredDevice, DeviceBox } from 'components';
import { store } from 'store';
const discoveredDevices = {};

const ws2 = new WebSocket("ws://localhost:8000/api/ws/blediscovery");

const Board = () => {
    const [boxes, setBoxes] = useState([]);
    const [discoveryOn, setDiscoveryOn] = useState(false);
    const [devicesDisplay, setDevicesDisplay] = useState([]);
    const globalState = useContext(store);
    const { dispatch, state } = globalState;
    useEffect(() => {
        ws2.onmessage = async(message) => {
            const discoveredDevice = JSON.parse(message.data);
            discoveredDevices[discoveredDevice.address] = discoveredDevice;
            const deviceList = Object.values(discoveredDevices);
            deviceList.sort((a, b) => b.rssiAverage - a.rssiAverage);
            setDevicesDisplay(deviceList);
            dispatch({ type: 'SET_DISCOVERED_DEVICES', payload: deviceList });
        };
    }, [])
    
    const { addedDevices = {} } = state;
    const deleteBox = (id) => {
        setBoxes(boxes.filter((box) => box.id !== id));
    };

    const addBox = () => {
        setBoxes([...boxes, { id: Date.now() }]);
    };

    const handleDiscoveryToggle = async() => {
        const newDiscoveryState = !discoveryOn;
        const response = await fetch('http://localhost:8000/api/ble/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discovery: newDiscoveryState })
        });
        
        if (response.status === 200) {
            setDiscoveryOn(newDiscoveryState);
        }
        else {
            console.error("Discovery request failed.")
        }
    }

    // const listDevices = () => {
    //     const devices = [];
    //     for (const [_, discoveredDevice] of Object.entries(discoveredDevices)) {
    //         const device = <DiscoveredDevice discoveredDevice={discoveredDevice} key={discoveredDevice.address} />;
    //         setDevices([...devices, device]);
    //     }
    //     return devices;
    // }

    const devices = devicesDisplay.map((device) => {
        return <DiscoveredDevice discoveredDevice={device} key={device.address} />;
    })

    return (
        <div id="board">
            <button onClick={addBox}>Add Box</button>
            <input type="checkbox" onChange={handleDiscoveryToggle} checked={discoveryOn}/>
            {Object.values(addedDevices)?.map((device) => {
                return <DeviceBox deviceId={device?.deviceId} key={device?.deviceId} device={device} />;
            })}

            {boxes.map((box) => (
                <FunctionBox key={box.id} deleteBox={() => deleteBox(box.id)} boxId={box.id} />
            ))}
            {devices}
        </div>
    );
}

export default Board;