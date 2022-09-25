import { useMemo } from 'react';

let _nodeIdCounter = 0;
export const useNextNodeId = () => useMemo(() => _nodeIdCounter++, []);
