import { useState } from 'react';
import { useContextSelector  } from 'use-context-selector';
import { Box, Accordion } from 'components';
import { store } from 'store';

const properties = {
    read: async(deviceId, characteristic, setValue) => {
        const response = await fetch('http://localhost:8000/api/ble/read/characteristic', {
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
            setValue(buffer);
        }
        else {
            console.error('Read failed.');
        }
    },
    notify: async(deviceId, characteristic) => {
        const response = await fetch('http://localhost:8000/api/cmd/stream/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                streamId: characteristic.streamId
            })
        });
        if (response.status === 200) {
            console.log('Notify success!');
        }
        else {
            console.error('Notify fail!');
        }
    }
}

const Property = ({ property, characteristic, deviceId }) => {
    const [value, setValue] = useState(new Uint8Array([]));
    const [parser, setParser] = useState("hex");

    const streamId = (characteristic?.streamId?.deviceId << 8) | characteristic?.streamId?.channelId;
    const stream = useContextSelector(store, ({ state }) => state.streams?.[streamId]) ?? {};

    const payload = stream.payload ? Array.from(stream.payload) : Array.from(value);
    const action = properties[property];

    let parsed = '';
    switch (parser) {
        case "hex":
            parsed = payload.map((x) => x < 0x10 ? "0" + x.toString(16) : x.toString(16)).join(' ');
            break;
        case "dec":
            parsed = payload.join(', ');
            break;
        case "str":
            parsed = String.fromCharCode(...payload);
            break;
        default:
            throw Error(`Bad value for parse: ${parser}`);
    }

    const id = property + characteristic.uuid + deviceId.toString(10);

    return ( 
        <li className="property">
            <button onClick={() => action(deviceId, characteristic, setValue)}>{property}</button>
            
            <div className="format-radios">
                <input type="radio" id={"hex" + id} name={"parser" + id} value="hex" onChange={() => setParser("hex")} checked={parser === "hex"} />
                <label for={"hex" + id}>hex</label>

                <input type="radio" id={"dec" + id} name={"parser" + id} value="dec" onChange={() => setParser("dec")}/>
                <label for={"dec" + id}>dec</label>

                <input type="radio" id={"str" + id} name={"parser" + id} value="str" onChange={() => setParser("str")}/>
                <label for={"str" + id}>str</label>
            </div>
            
            <div className="property-text-box">{parsed}&nbsp;</div>
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

    const deleteBox = async () => {
        const response = await fetch('http://localhost:8000/api/cmd/del', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: deviceId,
            })
        });
        if (response.status === 200) {
            dispatch({ type: 'REMOVE_DEVICE', payload: deviceId });   
        }
        else {
            console.error('Delete failed.');
        }
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