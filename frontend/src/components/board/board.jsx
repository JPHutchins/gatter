import { Arrows, ByteParser, DeviceBox, DiscoveredDevice, FunctionBox, LogSettings, Printer, Ramp } from 'components';
import { useState } from 'react';
import { Xwrapper } from 'react-xarrows';
import { store } from 'store';
import { useContextSelector } from 'use-context-selector';

const Board = ({ discoveredDevices }) => {
    const dispatch = useContextSelector(store, ({ dispatch }) => dispatch);
    const { selectedOutput, boxes, addedDevices, printers, byteParsers, ramps } = useContextSelector(store, (
        { state: { selectedOutput, boxes, addedDevices, printers, byteParsers, ramps } }) => (
        { selectedOutput, boxes, addedDevices, printers, byteParsers, ramps }));

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
        if (selectedOutput !== null) {
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
                {Object.values(boxes).map((box) => (
                    <FunctionBox
                        key={box.boxId}
                        deleteBox={() => dispatch({ type: 'REMOVE_BOX', boxId: box.boxId })}
                        boxId={box.boxId}
                    />
                ))}
                {Object.values(addedDevices).map((device) => (
                    <DeviceBox
                        deviceId={device?.deviceId}
                        key={device?.deviceId}
                        device={device}
                    />
                ))}
                {Object.values(printers).map((box) => (
                    <Printer key={box.boxId} boxId={box.boxId} />
                ))}
                {Object.values(byteParsers).map((box) => (
                    <ByteParser key={box.boxId} boxId={box.boxId} />
                ))}
                {Object.values(ramps).map((device) => (
                    <Ramp key={device.deviceId} boxId={device.deviceId} device={device} />
                ))}
                <Arrows />
            </Xwrapper>
        </div>
    );
};

export default Board;