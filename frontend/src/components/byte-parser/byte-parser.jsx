import { useState } from 'react';
import { useContext } from 'use-context-selector';
import { store } from 'store';

const toHexString = (b) => b.toString(16).padStart(2, '0').toUpperCase();

const makeToSquareId = (streamId) => (i) => `byte-parser-${streamId}_square-${i}`

const ByteCastProto = {
    cast(bytes, offset, len) {
        const view = new DataView(bytes.buffer, offset, len);
        const arrLength = len / this.size;
        if (len % this.size != 0) {
            throw Error("Byte length, len, must be multiple of data type size, size.")
        }
        const arr = Array(arrLength);
        for (let i = 0; i < arrLength; i++) {
            arr[i] = view[this.getter](i * this.size, true);
        }
        return arr;
    }
}

const Char = {
    name: "char",
    cast: (bytes, offset, len) => String.fromCharCode(...Array.from(bytes.slice(offset, offset + len))),
};

const Uint8 = {
    name: "uint8",
    size: 1,
    getter: 'getUint8',
    __proto__: ByteCastProto
};

const Int8 = {
    name: "int8",
    size: 1,
    getter: 'getInt8',
    __proto__: ByteCastProto
}

const Uint16 = {
    name: "uint16",
    size: 2,
    getter: 'getUint16',
    __proto__: ByteCastProto
};

const Int16 = {
    name: "int16",
    size: 2,
    getter: 'getInt16',
    __proto__: ByteCastProto
};

const Uint32 = {
    name: "uint32",
    size: 4,
    getter: 'getUint32',
    __proto__: ByteCastProto
};

const Int32 = {
    name: "int32",
    size: 4,
    getter: 'getInt32',
    __proto__: ByteCastProto
};

const Float32 = {
    name: "float32",
    size: 4,
    getter: 'getFloat32',
    __proto__: ByteCastProto
}

const Uint64 = {
    name: "uint64",
    size: 8,
    getter: 'getBigUint64',
    __proto__: ByteCastProto
};

const Int64 = {
    name: "int64",
    size: 8,
    getter: 'getBigInt64',
    __proto__: ByteCastProto
};

const Float64 = {
    name: "float64",
    size: 8,
    getter: 'getFloat64',
    __proto__: ByteCastProto
};

const DATA_TYPES_BY_LENGTH = {
    1: [Uint8, Int8, Char],
    2: [Uint16, Int16],
    4: [Uint32, Int32, Float32],
    8: [Uint64, Int64, Float64],
};


const ByteParser = () => {
    const globalState = useContext(store);
    const { dispatch, state } = globalState;

    const streamId = 0;  // TODO: from props
    const TEST_DATA = Array.from(Uint8Array.from([65, 66, 67, 68, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10]));
    const BUFFER = Uint8Array.from([65, 66, 67, 68, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10]);
    const toSquareId = makeToSquareId(streamId);

    const [startingSquare, setStartingSquare] = useState(null);
    const [endingSquare, setEndingSquare] = useState(null);

    // const [groups, setGroups] = useState([]);
    const { groups } = state;

    console.log(groups);

    const _crossesGroup = (groups, startingSquare) => (endingSquare) => {
        if (startingSquare === endingSquare) {
            return false;
        }

        const lowerSquare = startingSquare <= endingSquare ? startingSquare : endingSquare;
        const higherSquare = startingSquare > endingSquare ? startingSquare : endingSquare;

        for (const [i, { start, end }] of groups.entries()) {
            console.log(start, end, lowerSquare, higherSquare)
            if (endingSquare > startingSquare) {
                /* selection is right -> left ("low to high", "in order") */
                if (lowerSquare <= start && higherSquare >= end) {
                    return true;
                }
            } else {
                /* selection is left -> right ("high to low", "backwards") */
                if (higherSquare >= end && lowerSquare <= start) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Return true if a hovered ending square would cross any defined group, else false.
     */
    const crossesGroup = _crossesGroup(groups, startingSquare);

    const handleSquareClick = (i) => (e) => {
        e.preventDefault();

        if (startingSquare === null) {
            /* this click selects the starting square */
            setStartingSquare(i);
        } else if (endingSquare === null) {
            /* no valid ending square is selected, do nothing */
            return;
        } else {
            /* a starting square has been selected and this click selects the ending square */
            setStartingSquare(null);
            setEndingSquare(null);
            let start = null;
            let end = null
            if (startingSquare <= endingSquare) {
                start = startingSquare;
                end = endingSquare;
            } else {
                start = endingSquare;
                end = startingSquare;
            }
            dispatch({
                type: 'SET_BYTE_PARSER_GROUPS',
                groups: [...groups, {start, end, dataType: Uint8}].sort((a, b) => a.start - b.start)
            })
        }
    }

    const handleMouseEnter = (i) => (e) => {
        e.preventDefault();

        if (startingSquare === null || crossesGroup(i)) {
            /* after a starting square has been selected, this allows some ending squares */
            setEndingSquare(null);
            return;
        }

        setEndingSquare(i);
    }

    const handleMouseLeave = (i) => (e) => {
        e.preventDefault()
        setEndingSquare(null);
    }

    /**
     * Remove the group that was clicked.
     * 
     * @param {number} i The group to remove.  
     */
    const handleGroupClick = (i) => () => {
        groups.splice(i, 1);
        dispatch({
            type: 'SET_BYTE_PARSER_GROUPS',
            groups: groups
        })
    }

    const makeLines = (i) => {
        const lines = []
        const typeDropdowns = [];
        const convertedGroups = [];

        let groupsEndingInThisRow = 0;
        let j = -1;
        for (const {start, end, dataType} of groups) {
            j += 1;
            if (!(end >= i && end < i + 8)) {
                continue;
            }

            groupsEndingInThisRow += 1;

            /* if the group continues from a previous line, set start to the rightmost position */
            let xStart = Math.max(start, i);

            /* put them in 0-7 range (we only care about x position in the row) */
            xStart %= 8;
            const xEnd = end % 8;

            const x = (0.9375 - ((xEnd + xStart) / 2) / 8) * 100;
            const y = 20 * groupsEndingInThisRow;
            
            lines.push(
                <>
                    <line x1={`${x}%`} y1="0" x2={`${x}%`} y2={y} style={{stroke: "rgb(0,0,0)", strokeWidth: 2}} />
                    <line x1={`${x}%`} y1={y} x2="100%" y2={y} style={{stroke: "rgb(0,0,0)", strokeWidth: 2}} />
                </>
            )

            const groupLength = end - start + 1;

            const options = Object.entries(DATA_TYPES_BY_LENGTH).reduce((acc, [size, types]) => (
                (groupLength % size != 0) ? acc : [
                    ...acc,
                    ...types.map(({ name }) => (
                        <option value={name}>{`${name} [${groupLength / size}]`}</option>
                    ))
                ]
            ), [])
            
            const handleChange = (groups, start, end, j) => (e) => {
                for (const values of Object.values(DATA_TYPES_BY_LENGTH)) {
                    for (const dataType of values) {
                        if (e.target.value === dataType.name) {
                            const newGroups = [...groups]
                            newGroups[j] = {start, end, dataType}
                            dispatch({
                                type: 'SET_BYTE_PARSER_GROUPS',
                                groups: newGroups
                            })
                        }
                    }
                }
            }

            typeDropdowns.push(
                <select onChange={handleChange(groups, start, end, j)}>
                    {options}
                </select>
            );

            const parsedValue = dataType?.cast(BUFFER, start, groupLength);

            let prettyPrinted = null;
            if (parsedValue) {
                prettyPrinted = dataType?.name === "char" ? parsedValue : parsedValue.map((x) => `${x}, `)
            }

            convertedGroups.push(<div>{parsedValue ? prettyPrinted : 0}</div>);
        }

        return [lines, typeDropdowns, convertedGroups];
    }


    const rows = () => {
        const rows = [];

        for (let i = 0; i < TEST_DATA.length; i += 8) {
            const [lines, typeDropdowns, convertedGroups] = makeLines(i);
            rows.push(
                <>
                    <tr>
                        {[...Array(8).keys()].reverse().map((j) => <td key={i+j} className="byte-index">{i + j}</td>)}
                    </tr>
                    <tr key={`byte-parser-${streamId}_row-${i}`}>
                        {TEST_DATA.concat(Array(8).fill(-1)).slice(i, i + 8).reverse().map((b, j) => {
                            let byteIndex = 7 - j + i;
                            let id = toSquareId(byteIndex);

                            for (const [i, {start, end}] of groups.entries()) {
                                if (byteIndex >= start && byteIndex <= end) {
                                    let groupedClassName = 'grouped';
                                    if (byteIndex === start) {
                                        groupedClassName = 'grouped-right-boundary';
                                    }
                                    if (byteIndex === end) {
                                        groupedClassName = 'grouped-left-boundary';
                                    }
                                    if (byteIndex === start && byteIndex === end) {
                                        groupedClassName = 'grouped-single-square';
                                    }
                                    return (
                                        <td
                                            id={id}
                                            key={id}
                                            className={`byte-parser-square ${groupedClassName}`}
                                            onClick={() => handleGroupClick(i)()}
                                        >
                                            {toHexString(b)}
                                        </td>
                                    )
                                }
                            }

                            let start = byteIndex === startingSquare ? 'start' : '';
                            let end = byteIndex === endingSquare ? 'end' : '';
                            let middle = (startingSquare !== null && endingSquare !== null) &&
                                ((endingSquare > startingSquare && byteIndex < endingSquare && byteIndex > startingSquare)
                                    || (startingSquare > endingSquare && byteIndex > endingSquare && byteIndex < startingSquare)) ? 'middle' : '';
                            let empty = b === -1 ? 'empty' : '';
                            return (
                                <td
                                    id={id}
                                    key={id}
                                    className={`byte-parser-square ${start} ${end} ${middle} ${empty}`}
                                    onClick={(e) => handleSquareClick(byteIndex)(e)}
                                    onMouseEnter={(e) => handleMouseEnter(byteIndex)(e)}
                                    onMouseLeave={(e) => handleMouseLeave(byteIndex)(e)}
                                >
                                    {toHexString(b)}
                                </td>
                            )
                        })}
                    </tr>
                    <tr>
                        <td colSpan="8" className="line-container">
                            <svg height={`${20 + 20 * lines.length}px`} width="100%" style={{height: "100%" }}>
                                {lines}
                            </svg>
                        </td>
                        <td className="type-dropdowns-container">
                            <>
                                {typeDropdowns}
                            </>
                        </td>
                        <td className="converted-groups-container">
                            <>
                                {convertedGroups}
                            </>
                        </td>
                    </tr>
                </>
            )
        }
        return rows
    }

    return (
        <div className='byte-parser'>
            <table>
                <colgroup>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                </colgroup>
                <tbody>
                    {rows()}
                </tbody>
            </table>
        </div>

    );

};

export default ByteParser;