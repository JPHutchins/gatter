const ByteCastProto = {
    cast(bytes, offset, len) {
        const view = new DataView(bytes.buffer, offset + bytes.byteOffset, len);
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

export const Uint8 = {
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

export const DATA_TYPES_BY_LENGTH = {
    1: [Uint8, Int8, Char],
    2: [Uint16, Int16],
    4: [Uint32, Int32, Float32],
    8: [Uint64, Int64, Float64],
};