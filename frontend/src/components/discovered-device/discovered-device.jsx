import { useContext } from 'use-context-selector';
import { store } from 'store';

const DiscoveredDevice = ({ discoveredDevice }) => {
    const globalState = useContext(store);
    const { dispatch } = globalState;

    const addDevice = async() => {
        const response = await fetch('http://localhost:8000/api/cmd/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                emitterType: 'ble',
                address: discoveredDevice.address
            })
        });
        if (response.status === 200) {
            const addResponse = await response.json();
            const device = { ...addResponse, ...discoveredDevice };
            dispatch({ type: 'ADD_DEVICE', device });
        }
        else {
            console.error('Device add failed.');
        }
    }

    return (
        <div className="discovered-device">
            <br/>
            {discoveredDevice.address} {discoveredDevice.name}
            <br/>RSSI: {discoveredDevice.rssi}
            <br/>avg: {discoveredDevice.rssiAverage}
            <br/>
            <button onClick={addDevice}>Add</button>
        </div>
    );
}

export default DiscoveredDevice;