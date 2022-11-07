import { Arrows, DeviceBox, DiscoveredDevice, FunctionBox, LogSettings } from 'components';
import { useState } from 'react';
import { Xwrapper } from 'react-xarrows';
import { store } from 'store';
import { useContext } from 'use-context-selector';

const Board = () => {
    const { dispatch, state } = useContext(store);

    const [discoveryOn, setDiscoveryOn] = useState(false);

    const deviceList = Object.values(state.discoveredDevices).sort((a, b) => b.rssiAverage - a.rssiAverage);

    const handleDiscoveryToggle = async () => {
        const newDiscoveryState = !discoveryOn;
        const response = await fetch('http://localhost:8000/api/ble/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discovery: newDiscoveryState })
        });

        if (response.status === 200) {
            setDiscoveryOn(newDiscoveryState);
        } else {
            console.error('Discovery request failed.')
        }
    };

    const handleMouseUp = () => {
        if (state.selectedOutput !== null) {
            dispatch({ type: 'END_CURSOR_NODE_DRAG' })
        }
    };

    return (
        <div id="board" onMouseUp={handleMouseUp}>
            <button onClick={() => dispatch({ type: 'ADD_BOX', boxId: Date.now() })}>Add Box</button>
            <input type="checkbox" onChange={handleDiscoveryToggle} checked={discoveryOn} />
            <LogSettings />
            {deviceList.map((device) => (
                <DiscoveredDevice discoveredDevice={device} key={device.address} />
            ))}
            <Xwrapper>
                {Object.values(state.boxes).map((box) => (
                    <FunctionBox
                        key={box.boxId}
                        deleteBox={() => dispatch({ type: 'REMOVE_BOX', boxId: box.boxId })}
                        boxId={box.boxId}
                    />
                ))}
                {Object.values(state.addedDevices).map((device) => (
                    <DeviceBox
                        deviceId={device?.deviceId}
                        key={device?.deviceId}
                        device={device}
                    />
                ))}
                <Arrows />
            </Xwrapper>
        </div>
    );
};

export default Board;