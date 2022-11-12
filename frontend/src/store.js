import { useReducer } from 'react';
import { createContext } from 'use-context-selector';

const INITIAL_STATE = {
    connections: [],
    currentCursorNodeArrow: null,
    boxes: {},
    printers: {},
    discoveredDevices: {},
    selectedOutput: null,
    addedDevices: {}
};

const store = createContext(INITIAL_STATE);
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'SET_DISCOVERED_DEVICES':
                return {
                    ...state, discoveredDevices: {
                        ...state.discoveredDevices,
                        ...action.discoveredDevices,
                    }
                };
            case 'SET_ADDED_DEVICES':
                return {
                    ...state, addedDevices: {
                        ...state.addedDevices,
                        ...action.payload
                    }
                };
            case 'ADD_DEVICE':
                return {
                    ...state, addedDevices: {
                        ...state.addedDevices,
                        [action.device.deviceId]: action.device
                    }
                };
            case 'REMOVE_DEVICE':
                const { [action.deviceId]: removedDevice, ...rest } = state.addedDevices;
                return { ...state, addedDevices: rest };
            case 'UPDATE_STREAM':
                const streamId = (action.deviceId << 8) | action.channelId;
                return {
                    ...state, streams: {
                        ...state.streams,
                        [streamId]: action.stream
                    }
                };
            case 'SET_DEVICE_INFO':
                return {
                    ...state, addedDevices: {
                        ...state.addedDevices,
                        [action.deviceId]: {
                            ...state.addedDevices[action.deviceId],
                            ...action.device
                        }
                    }
                };
            case 'ADD_BOX':
                return {
                    ...state, boxes: {
                        ...state.boxes,
                        [action.boxId]: {
                            boxId: action.boxId,
                            func: (x) => x
                        }
                    }
                };
            case 'ADD_PRINTER':
                return {
                    ...state, printers: {
                        ...state.printers,
                        [action.boxId]: { boxId: action.boxId }
                    }
                };
            case 'REMOVE_BOX':
                const remainingBoxes = { ...state.boxes };
                delete remainingBoxes[action.boxId];
                return { ...state, boxes: remainingBoxes }
            case 'SET_JS_FUNCTION':
                return {
                    ...state, boxes: {
                        ...state.boxes,
                        [action.boxId]: {
                            ...state.boxes[action.boxId],
                            func: action.func,
                        }
                    }
                };
            case 'SET_BOX_INPUTS':
                return {
                    ...state, boxes: {
                        ...state.boxes,
                        [action.boxId]: {
                            ...state.boxes[action.boxId],
                            inputs: action.inputs,
                        }
                    }
                }
            case 'START_CURSOR_NODE_DRAG':
                return {
                    ...state,
                    selectedOutput: action.payload.start,
                    currentCursorNodeArrow: action.payload
                };
            case 'END_CURSOR_NODE_DRAG':
                return {
                    ...state,
                    selectedOutput: null,
                    currentCursorNodeArrow: null,
                };
            case 'ADD_CONNECTION':
                return {
                    ...state,
                    connections: [
                        ...state.connections,
                        {
                            start: state.selectedOutput,
                            end: action.end,
                            setIncomingArgs: action.setIncomingArgs,
                        }
                    ]
                };
            case 'REMOVE_CONNECTION':
                return {
                    ...state,
                    connections: state.connections.filter(({ start, end }) => (
                        !((start === action.payload) && (end === action.payload))
                    ))
                }
            case 'SET_BYTE_PARSER_GROUPS':
                return {
                    ...state,
                    groups: action.groups
                }
            default:
                return state;
        }
    }, INITIAL_STATE);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
