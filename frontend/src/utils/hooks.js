import { useMemo } from 'react';

let _nodeIdCounter = 0;
export const useNextNodeId = () => useMemo(() => _nodeIdCounter++, []);

export const makeUseNextId = (prefix) => () => useMemo(() => `${prefix}-${_nodeIdCounter++}`, [])