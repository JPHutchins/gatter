import { Arrows, ByteParser, DeviceBox, DiscoveredDevice, FunctionBox, LogSettings, Printer } from 'components';
import { useState } from 'react';
import { Xwrapper } from 'react-xarrows';
import { store } from 'store';
import { useContext } from 'use-context-selector';

const Board = ({ discoveredDevices }) => {
    const { dispatch, state } = useContext(store);

    const [discoveryOn, setDiscoveryOn] = useState(false);

    const deviceList = Object.values(discoveredDevices).sort((a, b) => b.rssiAverage - a.rssiAverage);

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
                {Object.values(state.printers).map((box) => (
                    <Printer key={box.boxId} boxId={box.boxId} />
                ))}
                {Object.values(state.byteParsers).map((box) => (
                    <ByteParser key={box.boxId} boxId={box.boxId} />
                ))}
                <Arrows />
            </Xwrapper>
        </div>
    );
};

export default Board;