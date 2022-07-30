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

export { store, StateProvider };