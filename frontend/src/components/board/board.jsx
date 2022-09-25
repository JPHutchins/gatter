import { useState, useEffect } from 'react';
import { useContext  } from 'use-context-selector';
import { FunctionBox } from 'components';
import { DiscoveredDevice, DeviceBox, LogSettings } from 'components';
import { store } from 'store';
import Xarrow, { Xwrapper } from 'react-xarrows';

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
    };

    const discoveredDeviceList = deviceList.map((device) => (
        <DiscoveredDevice discoveredDevice={device} key={device.address} />
    ));

    const arrows = state.connections.map(({ start, end, offsetX = 0, offsetY = 0 }) => (
        <Xarrow 
            key={`key-${start}-${end}`}
            start={start}
            end={end}
            endAnchor={{ position: "middle", offset: { x: offsetX, y: offsetY } }}
        />
    ))

    const handleMouseUp = (e) => {
        if (state?.selectedOutput !== null) {
            dispatch({type: 'END_CURSOR_NODE_DRAG'})
        }
    }

    return (
        <div id="board" onMouseUp={handleMouseUp}>
            <button onClick={addBox}>Add Box</button>
            <input type="checkbox" onChange={handleDiscoveryToggle} checked={discoveryOn}/>
            <LogSettings/>
            
            {discoveredDeviceList}

            <Xwrapper>
                {boxes.map((box) => (
                    <FunctionBox key={box.id} deleteBox={() => deleteBox(box.id)} boxId={box.id} />
                ))}

                {Object.values(addedDevices)?.map((device) => (
                    <DeviceBox deviceId={device?.deviceId} key={device?.deviceId} device={device} />
                ))}

                {arrows}
            </Xwrapper>
        </div>
    );
}

export default Board;