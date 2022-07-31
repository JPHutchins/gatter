import { useState } from 'react';
import { useContextSelector  } from 'use-context-selector';
import { Box, Accordion } from 'components';
import { store } from 'store';

const read = async(deviceId, characteristic, setReadResponse, property) => {
    let response = null;

    switch (property) {
        case "read":
            response = await fetch('http://localhost:8000/api/ble/read/characteristic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    deviceId: deviceId,
                    handle: characteristic.handle
                })
            });
            if (response.status === 200) {
                const readResponse = await response.arrayBuffer();
                const buffer = new Uint8Array(readResponse);
                const array = buffer.map((x) => x.toString(16));
                setReadResponse(`${array.join(" ")}`);   
            }
            else {
                console.error('Read failed.');
            }
            break;

        case "notify":
            response = await fetch('http://localhost:8000/api/cmd/stream/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    streamId: characteristic.streamId
                })
            });
            if (response.status === 200) {
                console.log("Notify success!");
            }
            else {
                console.error('Notify fail!');
            }
            break;
    }
};

const Property = ({ property, characteristic, deviceId }) => {
    const [readResponse, setReadResponse] = useState('');
    return ( 
        <li className="property">
            <button onClick={() => read(deviceId, characteristic, setReadResponse, property)}>{property}</button>
            <div>{readResponse}&nbsp;</div>
        </li>
    )
};

const PropertyList = ({ properties, characteristic, deviceId }) => (
    <ul className="property-list">
        {properties.map((property) => (
            <Property key={property} property={property} characteristic={characteristic} deviceId={deviceId} />
        ))}
    </ul>
);

const Characteristic = ({ characteristic, deviceId }) => (
    <li className="characteristic">
        <p>{characteristic.description || characteristic.uuid}</p>
        <PropertyList properties={characteristic.properties} characteristic={characteristic} deviceId={deviceId} />
    </li>
);

const Service = ({ service, deviceId }) => (
    <li>
        <Accordion title={service.description || service.uuid} level={2}>
            {service.characteristics?.map((characteristic, index) => (
                <Characteristic key={index} characteristic={characteristic} deviceId={deviceId} />
            ))}
        </Accordion>
    </li>
);

const DeviceBox = ({ deviceId, device }) => {
    const deviceInfo = useContextSelector(store, ({ state }) => state.addedDevices?.[deviceId]) ?? {};
    const dispatch = useContextSelector(store, ({ dispatch }) => dispatch);
    const connectDevice = async() => {
        const response = await fetch('http://localhost:8000/api/ble/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: deviceId
            })
        });
        if (response.status === 200) {
            console.log('Device connected!');
            const connectResponse = await response.json();
            dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceId, ...connectResponse } });
        }
        else {
            console.error('Device connect failed.');
        }
    };

    const deleteBox = () => {
        dispatch({ type: 'REMOVE_DEVICE', payload: deviceId });
    };

    return (
        <Box>
            <div className="device-box">
                <h1>{device.name}</h1>
                <p>{device.address}</p>
                <button onClick={connectDevice}>Connect</button>
                <button onClick={deleteBox}>Remove</button>
                {deviceInfo?.services?.length ? (
                    <Accordion title="Services" level={1} className="top-level">
                        {deviceInfo?.services?.map((service, index) => (
                            <Service key={index} service={service} deviceId={deviceId} />
                        ))}
                    </Accordion>
                ) : null}
            </div>
        </Box>
    );
}

export default DeviceBox;