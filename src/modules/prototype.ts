interface String {
    normal(): string;
    toOnlyWord(): string;
    toOnlyWordnNumber(): string;
    toNumber(): number;
    toOnlySpecialChar(): string;
    toFirstUpper(): string;
    toHumanName(): string;
    isContainSpecialChar(): boolean;
    removeExtraSpace(): string;
    removeUselessSpace(): string;
    queryOptimize(): string;
    toOnlyDigit(): string;
}
interface Number {
    inRange(min: number, max: number): boolean;
}

interface Array<T> {
    merge(arr2: any[]): any[];
    equal(arr2: any[]): boolean;
    subArray(len: number): any[];
}

/**
 * Normal char to unicode
 */
String.prototype.normal = function (): string {
    return this.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Convert string to only 0-9 character
 */
String.prototype.toOnlyDigit = function () {
    return this.replace(/\D/g, '');
};

/**
 * Convert string to lower case and keep only A-Z a-z character
 */
String.prototype.toOnlyWord = function () {
    let temp: string = this.toLowerCase().normal();
    return temp.replace(/[^A-Za-z ]+/g, ' ');
};

/**
 * Convert string to lower case and keep only A-Z a-z 0-9 character
 */
String.prototype.toOnlyWordnNumber = function () {
    let temp: string = this.toLowerCase().normal();
    return temp.replace(/[^A-Za-z0-9 ]+/g, ' ');
};

/**
 * Convert string to only 0-9 character
 */
String.prototype.toNumber = function () {
    return parseInt(this.replace(/\D/g, ''), 10) || 0;
};

/**
 * Convert string to only special character string
 */
String.prototype.toOnlySpecialChar = function () {
    return this.replace(/[A-Za-z0-9 ]+/g, '');
};

/**
 * Convert string to upper first case
 */
String.prototype.toFirstUpper = function () {
    if (!this[0]) {
        return this;
    }
    let temp = this.toLowerCase();
    return temp[0].toUpperCase() + temp.slice(1);
};

/**
 * Upper first case of each word -> Human name
 */
String.prototype.toHumanName = function (): string {
    let temp: string[] = this.toLowerCase().split(' ');
    let result = temp[0].toFirstUpper();
    temp.slice(1).forEach((word) => {
        result += ' ' + word.toFirstUpper();
    });
    return result;
};

/**
 * Optimize query victim string
 */
String.prototype.queryOptimize = function (): string {
    let currentString: string = this;
    [
        { change: /\.\./g, to: '.' },
        { change: /;/g, to: ',' },
    ].forEach((optimize) => {
        currentString = currentString.replace(optimize.change, optimize.to);
    });
    return currentString;
};

/**
 * Check if string is only contain letters
 */
String.prototype.isContainSpecialChar = function () {
    return !/^[a-zA-Z ]+$/.test(this);
};

/**
 * Remove all duplicated space in string
 */
String.prototype.removeExtraSpace = function () {
    return this.replace(/\s+/g, ' ');
};

/**
 * Remove beginner space in string
 */
String.prototype.removeUselessSpace = function () {
    let output = this;
    while (!/^[a-zA-Z0-9]+$/.test(output[0])) {
        output = output.substring(1, output.length);
    }
    while (!/^[a-zA-Z0-9(/)]+$/.test(output[output.length - 1])) {
        output = output.substring(0, output.length - 1);
    }
    return output;
};

/**
 * Check if number in in range min - max
 */
Number.prototype.inRange = function (min: number, max: number): boolean {
    return (this - min) * (this - max) <= 0;
};

/**
 * Merge two array and remove it duplicate items
 */
Array.prototype.merge = function (arr2: []): any[] {
    return Array.from(new Set(this.concat(arr2)));
};

/**
 * Split array into chuck
 */
Array.prototype.subArray = function (len: number): any[] {
    let chunks = [];
    let i = 0;
    let n = this.length;
    while (i < n) {
        chunks.push(this.slice(i, (i += len)));
    }
    return chunks;
};

/**
 * Check if two array is equal, and it items like eachother
 */
Array.prototype.equal = function (arr2: []): boolean {
    return JSON.stringify(this) === JSON.stringify(arr2);
};
