import React, { Fragment, useState } from 'react';
import { useContext } from 'use-context-selector';
import { store } from 'store';

import { Box, Node } from 'components';
import { NODE } from 'utils/constants';

import { Uint8, DATA_TYPES_BY_LENGTH } from './helpers';

const toHexString = (byte) => byte.toString(16).padStart(2, '0').toUpperCase();

const ROW_HEIGHT_PX = 16;
const BYTES_IN_ROW = 8;
const PADDING_TD = -1

const ByteParser = () => {
    const globalState = useContext(store);
    const { dispatch, state } = globalState;

    const TEST_DATA = Array.from(Uint8Array.from([65, 66, 67, 68, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10]));
    const BUFFER = Uint8Array.from([65, 66, 67, 68, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10, 0, 1, 2, 3, 0xff, 0xfe, 0xfd, 0xfc, 10]);

    const [startingSquare, setStartingSquare] = useState(null);
    const [endingSquare, setEndingSquare] = useState(null);

    const { groups } = state;

    /**
     * Return true if a hovered ending square would cross any defined group, else false.
     */
    const crossesGroup = (groups, startingSquare, endingSquare) => {
        if (startingSquare === endingSquare) {
            return false;
        }

        const lowerSquare = startingSquare <= endingSquare ? startingSquare : endingSquare;
        const higherSquare = startingSquare > endingSquare ? startingSquare : endingSquare;

        for (const [_, { start, end }] of groups.entries()) {
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
     * Start selecting a group or finalize selection of a group.
     * 
     * @param {number} i The byte offset (index) of the square that was clicked on.
     */
    const handleSquareClick = (i) => {
        if (startingSquare === null) {
            /* this click selects the starting square */
            setStartingSquare(i);
            /* the starting square is a valid ending square */
            setEndingSquare(i);
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

    /**
     * Highlight if hovered square is a valid ending square.
     * 
     * @param {number} i The byte offset (index) of the square that was clicked on.
     */
    const handleMouseEnter = (i) => {
        if (startingSquare === null || crossesGroup(groups, startingSquare, i)) {
            /* not a valid ending square */
            setEndingSquare(null);
            return;
        }

        setEndingSquare(i);
    }

    /**
     * Remove the group that was clicked.
     * 
     * @param {number} i The group to remove.  
     */
    const handleGroupClick = (i) => {
        groups.splice(i, 1);
        dispatch({
            type: 'SET_BYTE_PARSER_GROUPS',
            groups: groups
        })
    }

    /**
     * Render the line, data option selectors, parsed values, and output nodes for the row.
     * 
     * @param {number} firstIndexOfRow The first index of a row of bytes, e.g. 0, 8, 16, etc.
     * @returns {[JSX.Element, JSX.Element, JSX.Element, JSX.Element]} The lines, dropdowns, parsed values, and nodes.
     */
    const renderParsedGroups = (firstIndexOfRow) => {
        const lines = []
        const typeDropdowns = [];
        const convertedGroups = [];
        const outputNodes = [];

        const RIGHT_MOST_X_FRACTION = 1 - (1 / BYTES_IN_ROW / 2)  /* 0.9375 */

        let groupsEndingInThisRow = 0;

        /* iterate each group of bytes and add the line, data options, and parsed values */
        for (const [groupIndex, {start, end, dataType}] of groups.entries()) {
            if (!(end >= firstIndexOfRow && end < firstIndexOfRow + BYTES_IN_ROW)) {
                continue;  /* group doesn't end in this row */
            }

            groupsEndingInThisRow += 1;

            /* if the group continues from a previous line, set start to the rightmost position */
            let xStart = Math.max(start, firstIndexOfRow);

            /* put them in 0 -> BYTES_IN_ROW range (we only care about x position in the row) */
            xStart %= BYTES_IN_ROW;
            const xEnd = end % BYTES_IN_ROW;

            /* calculate x offset percentage based on position of the group in the row */
            const x = (RIGHT_MOST_X_FRACTION - ((xEnd + xStart) / 2) / BYTES_IN_ROW) * 100;
            const y = (ROW_HEIGHT_PX / 2) + ROW_HEIGHT_PX * (groupsEndingInThisRow - 1);
            
            lines.push(
                <Fragment key={groupIndex}>
                    <line x1={`${x}%`} y1="0" x2={`${x}%`} y2={y} />
                    <line x1={`${x}%`} y1={y} x2="100%" y2={y} />
                </Fragment>
            )

            const groupLength = end - start + 1;  /* the number of 8-bit bytes in the group */

            /* data types where groupLength is divisible by data type size (in bytes) are options */
            const options = Object.entries(DATA_TYPES_BY_LENGTH).reduce((acc, [size, types]) => (
                (groupLength % size !== 0) ? acc : [
                    ...acc,
                    ...types.map(({ name }) => (
                        <option key={name} value={name}>{`${name} [${groupLength / size}]`} </option>
                    ))
                ]
            ), [])
            
            /* create the data type change handler */
            const handleTypeChange = (groups, start, end, groupIndex) => (e) => {
                for (const values of Object.values(DATA_TYPES_BY_LENGTH)) {
                    for (const dataType of values) {
                        if (e.target.value === dataType.name) {
                            const newGroups = [...groups]
                            newGroups[groupIndex] = {start, end, dataType}
                            dispatch({
                                type: 'SET_BYTE_PARSER_GROUPS',
                                groups: newGroups
                            })
                        }
                    }
                }
            }

            typeDropdowns.push(
                <select key={groupIndex} value={dataType.name} onChange={handleTypeChange(groups, start, end, groupIndex)}>
                    {options}
                </select>
            );

            /* parse the value from the group of bytes according to the selected data type */
            const parsedValue = dataType.cast(BUFFER, start, groupLength);
            const prettyPrinted = dataType.name === "char" ? parsedValue : `[${parsedValue.join(', ')}]`;
            
            convertedGroups.push(
                <div key={groupIndex}>
                    {prettyPrinted}
                </div>
            );

            outputNodes.push(
                <div key={groupIndex}>
                    <Node direction={NODE.OUTPUT} />
                </div>
            );
        }

        return [lines, typeDropdowns, convertedGroups, outputNodes];
    }

    /**
     * Create the td element for the given byte.
     * 
     * @param {number} byte The value of the byte, e.g. 0-255, 0x00-0xFF
     * @param {number} byteIndex The offset of the byte (array index)
     * @returns {JSX.Element} The td element for the byte.
     */
    const renderByteTd = (byte, byteIndex) => {
        let className = null;
        let onClick = null;
        let onMouseEnter = null;
        let onMouseLeave = null;

        for (const [groupIndex, {start, end}] of groups.entries()) {
            if (byteIndex >= start && byteIndex <= end) {   // byte is part of a group
                let groupedClassName = 'grouped';
                if (byteIndex === start && byteIndex !== end) {
                    groupedClassName += ' right-boundary';
                }
                if (byteIndex === end && byteIndex !== start) {
                    groupedClassName += ' left-boundary';
                }
                if (byteIndex !== start && byteIndex !== end) {
                    groupedClassName += ' interior';
                }

                className = `byte-parser-square ${groupedClassName}`;
                onClick = () => handleGroupClick(groupIndex);

                break;
            }
        }

        if (className === null) {  // byte is not part of a group
            const start = byteIndex === startingSquare ? 'start' : '';
            const end = byteIndex === endingSquare ? 'end' : '';
            const middle = (startingSquare !== null && endingSquare !== null) &&
                (
                    (endingSquare > startingSquare && byteIndex < endingSquare && byteIndex > startingSquare) ||
                    (startingSquare > endingSquare && byteIndex > endingSquare && byteIndex < startingSquare)
                ) ? 'middle' : '';
            const empty = byte === PADDING_TD ? 'empty' : '';

            className = `byte-parser-square ${start} ${end} ${middle} ${empty}`;
            onClick = () => handleSquareClick(byteIndex);
            onMouseEnter = () => handleMouseEnter(byteIndex);
            onMouseLeave = () => setEndingSquare(null);
        }
        
        return (
            <td
                key={byteIndex}
                className={className}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {toHexString(byte)}
            </td>
        )
    }

    /**
     * Render the rows of the ByteParser.
     * 
     * @returns The list of row elements.  Each "row" is three tr elements.
     */
    const renderRows = () => {
        const rows = [];

        for (let firstIndexOfRow = 0; firstIndexOfRow < TEST_DATA.length; firstIndexOfRow += BYTES_IN_ROW) {
            const [lines, typeDropdowns, convertedGroups, outputNodes] = renderParsedGroups(firstIndexOfRow);
            rows.push(
                <Fragment key={firstIndexOfRow}>
                    <tr>
                        {[...Array(BYTES_IN_ROW).keys()]
                            .reverse()
                            .map((i) => <td key={i} className="byte-index">{i + firstIndexOfRow}</td>)
                        }
                    </tr>
                    <tr>
                        {TEST_DATA.concat(Array(BYTES_IN_ROW).fill(PADDING_TD))  // add padding
                            .slice(firstIndexOfRow, firstIndexOfRow + BYTES_IN_ROW)  // slice row
                            .reverse()  // bytes displayed right -> left; LSB ("index 0") in rightmost position
                            .map((byte, i) => {
                                const byteIndex = BYTES_IN_ROW - 1 - i + firstIndexOfRow;
                                return renderByteTd(byte, byteIndex);
                            })
                        }
                    </tr>
                    <tr>
                        <td colSpan={BYTES_IN_ROW} className="line-container">
                            <svg height={`${ROW_HEIGHT_PX * lines.length}px`} width="100%">
                                {lines}
                            </svg>
                        </td>
                        <td className="grid-cell">
                            <div className="type-dropdowns-container">
                                {typeDropdowns}
                            </div>
                            <div className="converted-groups-container">
                                {convertedGroups}
                            </div>
                            <div className="output-nodes-container">
                                {outputNodes}
                            </div>
                        </td>
                    </tr>
                </Fragment>
            )
        }
        return rows
    }

    return (
        <Box>
            <div className='byte-parser'>
                <Node direction={NODE.INPUT} />
                <table>
                    <tbody>
                        {renderRows()}
                    </tbody>
                </table>
            </div>
        </Box>
    );
};

export default ByteParser;