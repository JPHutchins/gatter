import { useState } from 'react';
import { useContext  } from 'use-context-selector';
import { FunctionBox } from 'components';
import { DiscoveredDevice, DeviceBox, LogSettings } from 'components';
import { store } from 'store';

const Board = () => {
    const [boxes, setBoxes] = useState([]);
    const [discoveryOn, setDiscoveryOn] = useState(false);
    const globalState = useContext(store);
    const { dispatch, state } = globalState;
    const { addedDevices = {}, discoveredDevices = {} } = state;
    const deviceList = Object.values(discoveredDevices).sort((a, b) => b.rssiAverage - a.rssiAverage);
    const deleteBox = (id) => {
        setBoxes(boxes.filter((box) => box.id !== id));
    };

    const addBox = () => {
        const boxId = Date.now();
        dispatch({
            type: 'ADD_BOX',
            boxId,
            previous: null,
            next: null,
        });
        setBoxes([...boxes, { id: boxId }]);
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
        } else {
            console.error("Discovery request failed.")
        }
    };

    const devices = deviceList.map((device) => {
        return <DiscoveredDevice discoveredDevice={device} key={device.address} />;
    });

    return (
        <div id="board">
            <button onClick={addBox}>Add Box</button>
            <input type="checkbox" onChange={handleDiscoveryToggle} checked={discoveryOn}/>
            <LogSettings/>
            {Object.values(addedDevices)?.map((device) => {
                return <DeviceBox deviceId={device?.deviceId} key={device?.deviceId} device={device} />;
            })}

            {boxes.map((box, i) => (
                <FunctionBox
                    key={box.id}
                    deleteBox={() => deleteBox(box.id)}
                    boxId={box.id}
                    previousBox={boxes[i - 1]?.id}
                    nextBox={boxes[i + 1]?.id}
                />
            ))}
            {devices}
        </div>
    );
}

export default Board;