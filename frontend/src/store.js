import { createContext } from 'use-context-selector';
import { useReducer } from 'react';

const initialState = { connections: [] };
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
                const { [action.deviceId]: removedDevice, ...rest } = state.addedDevices;
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
            case 'START_CURSOR_NODE_DRAG':
                return { 
                    ...state,
                    selectedOutput: action.payload.start,
                    connections: [ 
                        ...state.connections,
                        action.payload
                    ]
                }
            case 'END_CURSOR_NODE_DRAG':
                return { 
                    ...state,
                    selectedOutput: null,
                    connections: [ 
                        ...state.connections.filter(({start, end}) => (
                            !((start === state.selectedOutput) && (end === `cursor-${state.selectedOutput}`))
                        )),
                    ]
                }
            case 'ADD_CONNECTION':
                return { 
                    ...state,
                    connections: [ 
                        ...state.connections,
                        {start: state.selectedOutput, end: action.payload.end}
                    ]
                }
            case 'REMOVE_CONNECTION':
                return { 
                    ...state,
                    connections: state.connections.filter(({start, end}) => (
                        !((start === action.payload) && (end === action.payload))
                    ))
                }
            default:
                return state;
        }
    }, initialState);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };