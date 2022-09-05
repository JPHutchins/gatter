import { createContext } from 'use-context-selector';
import { useReducer } from 'react';

const initialState = {};
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'SET_DISCOVERED_DEVICES':
                return { ...state, discoveredDevices: {
                    ...state.discoveredDevices,
                    ...action.payload
                }
            };
            case 'SET_ADDED_DEVICES':
                return { ...state, addedDevices: {
                    ...state.addedDevices,
                    ...action.payload
                }
            };
            case 'ADD_DEVICE':
                return { ...state, addedDevices: {
                    ...state.addedDevices,
                    [action.payload.deviceId]: action.payload
                }
            };
            case 'REMOVE_DEVICE':
                const { [action.payload]: removedDevice, ...rest } = state.addedDevices;
                return { ...state, addedDevices: rest };
            case 'UPDATE_STREAM':
                const streamId = (action.payload.deviceId << 8) | action.payload.channelId;
                return { ...state, streams: {
                    ...state.streams,
                    [streamId]: action.payload
                }
            };
            case 'SET_DEVICE_INFO':
                return { ...state, addedDevices: {
                    ...state.addedDevices,
                    [action.payload.deviceId]: {
                        ...state.addedDevices[action.payload.deviceId],
                        ...action.payload
                    }
                }}
            default:
                return state;
        }
    }, initialState);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export const removeAllDevices = async(dispatch) => {
    const response = await fetch ('http://localhost:8000/api/dev/removeAll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 200) {
        dispatch({ type: 'SET_ADDED_DEVICES', payload: {} });
    } else {
        console.error(response);
    }
}

export { store, StateProvider, removeAllDevices };