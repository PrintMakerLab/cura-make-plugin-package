require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 3109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(2186));
const archiver_1 = __importDefault(__nccwpck_require__(3084));
const fs = __importStar(__nccwpck_require__(7147));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sourcePath = core.getInput('source_folder');
            let pluginId = core.getInput('plugin_id');
            let packageInfoPath = core.getInput('package_info_path');
            const staticFilePath = fs.existsSync(`${__dirname}/files`) ? `${__dirname}/files` : `${__dirname}/dist/files`;
            // get package info, or load "empty" package info template
            if (packageInfoPath === '' || !fs.existsSync(packageInfoPath)) {
                packageInfoPath = `${staticFilePath}/package.json`;
            }
            let packageInfo;
            try {
                const packageInfoData = fs.readFileSync(packageInfoPath, 'utf8');
                // parse JSON string to JSON object
                packageInfo = JSON.parse(packageInfoData);
            }
            catch (err) {
                throw err;
            }
            // get plugin info
            let pluginInfo;
            try {
                const pluginInfoData = fs.readFileSync(`${sourcePath}/plugin.json`, 'utf8');
                // parse JSON string to JSON object
                pluginInfo = JSON.parse(pluginInfoData);
            }
            catch (err) {
                throw err;
            }
            if (pluginId === '') {
                pluginId = packageInfo['package_id'];
                if (pluginId === '') {
                    throw new Error('`package_id` in package.json and the `plugin_id` argument must not both be empty');
                }
            }
            const pluginVersion = pluginInfo['version'];
            core.info(`Creating curapackages for ${pluginId} ${pluginVersion}...`);
            // copy plugin info into package info
            packageInfo.package_id = pluginId;
            packageInfo.package_version = pluginVersion;
            packageInfo.display_name = pluginInfo.name;
            if (packageInfoPath === `${staticFilePath}/package.json`) {
                packageInfo.description = pluginInfo.description;
            }
            const supportedSDKVersions = pluginInfo.supported_sdk_versions;
            const majorSDKVersions = new Set(supportedSDKVersions.map(function (versionString) {
                return parseInt(versionString.split('.')[0]);
            }));
            const packageFiles = [];
            for (const majorVersion of majorSDKVersions) {
                const semanticVersion = `${majorVersion}.0.0`;
                let curaVersions = '';
                switch (majorVersion) {
                    case 5:
                        curaVersions = '3.5-3.6';
                        break;
                    case 6:
                        curaVersions = '4.0-4.3';
                        break;
                    case 7:
                        curaVersions = '4.4-4.13';
                        break;
                    case 8:
                        curaVersions = '5.0';
                        break;
                    default:
                        curaVersions = 'Unknown';
                }
                const archiveFileName = `${pluginId}_v${pluginVersion}_Cura${curaVersions}.curapackage`;
                core.info(` -- ${archiveFileName}...`);
                packageFiles.push(archiveFileName);
                packageInfo.sdk_version = majorVersion;
                packageInfo.sdk_version_semver = semanticVersion;
                // create a file to stream archive data to.
                const output = fs.createWriteStream(archiveFileName);
                const archive = (0, archiver_1.default)('zip', {
                    zlib: { level: 9 }, // Sets the compression level.
                });
                // listen for all archive data to be written
                // "close" event is fired only when a file descriptor is involved
                output.on('close', function () {
                    core.info(`${archive.pointer()} total bytes`);
                    core.info('archiver has been finalized and the output file descriptor has closed.');
                });
                // This event is fired when the data source is drained no matter what was the data source.
                // It is not part of this library but rather from the NodeJS Stream API.
                // @see: https://nodejs.org/api/stream.html#stream_event_end
                output.on('end', function () {
                    core.info('Data has been drained');
                });
                // good practice to catch warnings (ie stat failures and other non-blocking errors)
                archive.on('warning', function (err) {
                    if (err.code === 'ENOENT') {
                        // log warning
                        core.info(err.message);
                    }
                    else {
                        // throw error
                        throw err;
                    }
                });
                // good practice to catch this error explicitly
                archive.on('error', function (err) {
                    throw err;
                });
                // pipe archive data to the file
                archive.pipe(output);
                archive.directory(sourcePath, `files/plugins/${pluginId}`, (file) => file.name.startsWith('.git') || file.name.includes('/.git') ? false : file);
                archive.append(JSON.stringify(packageInfo), { name: 'package.json' });
                archive.file(`${staticFilePath}/[Content_Types].xml`, {
                    name: '[Content_Types].xml',
                });
                archive.directory(`${staticFilePath}/_rels`, '_rels');
                // finalize the archive (ie we are done appending files but streams have to finish yet)
                // "close", "end" or "finish" may be fired right after calling this method so register to them beforehand
                archive.finalize();
            }
            core.setOutput('packages', packageFiles);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const uuid_1 = __nccwpck_require__(5840);
const oidc_utils_1 = __nccwpck_require__(8041);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = `ghadelimiter_${uuid_1.v4()}`;
        // These should realistically never happen, but just in case someone finds a way to exploit uuid generation let's not allow keys or values that contain the delimiter.
        if (name.includes(delimiter)) {
            throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
        }
        if (convertedVal.includes(delimiter)) {
            throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
        }
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(1327);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(1327);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(2981);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 8041:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(6255);
const auth_1 = __nccwpck_require__(5526);
const core_1 = __nccwpck_require__(2186);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 2981:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(1017));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 1327:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 5526:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ 6255:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__nccwpck_require__(3685));
const https = __importStar(__nccwpck_require__(5687));
const pm = __importStar(__nccwpck_require__(9835));
const tunnel = __importStar(__nccwpck_require__(4294));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            const res = yield this.get(requestUrl, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.post(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.put(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.patch(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
                    return response;
                }
                numTries += 1;
                if (numTries < maxTries) {
                    yield response.readBody();
                    yield this._performExponentialBackoff(numTries);
                }
            } while (numTries < maxTries);
            return response;
        });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        function handleResult(err, res) {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        }
        const req = info.httpModule.request(info.options, (msg) => {
            const res = new HttpClientResponse(msg);
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            for (const handler of this.handlers) {
                handler.prepareRequest(info.options);
            }
        }
        return info;
    }
    _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
            const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        });
    }
    _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const statusCode = res.message.statusCode || 0;
                const response = {
                    statusCode,
                    result: null,
                    headers: {}
                };
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
                        const a = new Date(value);
                        if (!isNaN(a.valueOf())) {
                            return a;
                        }
                    }
                    return value;
                }
                let obj;
                let contents;
                try {
                    contents = yield res.readBody();
                    if (contents && contents.length > 0) {
                        if (options && options.deserializeDates) {
                            obj = JSON.parse(contents, dateTimeDeserializer);
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9835:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        return new URL(proxyVar);
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ 1231:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * archiver-utils
 *
 * Copyright (c) 2012-2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-archiver/blob/master/LICENSE-MIT
 */
var fs = __nccwpck_require__(7758);
var path = __nccwpck_require__(1017);

var flatten = __nccwpck_require__(2394);
var difference = __nccwpck_require__(4031);
var union = __nccwpck_require__(1620);
var isPlainObject = __nccwpck_require__(6169);

var glob = __nccwpck_require__(95);

var file = module.exports = {};

var pathSeparatorRe = /[\/\\]/g;

// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
var processPatterns = function(patterns, fn) {
  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) { pattern = pattern.slice(1); }
    // Find all matching files for this pattern.
    var matches = fn(pattern);
    if (exclusion) {
      // If an exclusion, remove matching files.
      result = difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = union(result, matches);
    }
  });
  return result;
};

// True if the file path exists.
file.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// Return an array of all file paths that match the given wildcard patterns.
file.expand = function(...args) {
  // If the first argument is an options object, save those options to pass
  // into the File.prototype.glob.sync method.
  var options = isPlainObject(args[0]) ? args.shift() : {};
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(args[0]) ? args[0] : args;
  // Return empty set if there are no patterns or filepaths.
  if (patterns.length === 0) { return []; }
  // Return all matching filepaths.
  var matches = processPatterns(patterns, function(pattern) {
    // Find all matching files for this pattern.
    return glob.sync(pattern, options);
  });
  // Filter result set?
  if (options.filter) {
    matches = matches.filter(function(filepath) {
      filepath = path.join(options.cwd || '', filepath);
      try {
        if (typeof options.filter === 'function') {
          return options.filter(filepath);
        } else {
          // If the file is of the right type and exists, this should work.
          return fs.statSync(filepath)[options.filter]();
        }
      } catch(e) {
        // Otherwise, it's probably not the right type.
        return false;
      }
    });
  }
  return matches;
};

// Build a multi task "files" object dynamically.
file.expandMapping = function(patterns, destBase, options) {
  options = Object.assign({
    rename: function(destBase, destPath) {
      return path.join(destBase || '', destPath);
    }
  }, options);
  var files = [];
  var fileByDest = {};
  // Find all files matching pattern, using passed-in options.
  file.expand(options, patterns).forEach(function(src) {
    var destPath = src;
    // Flatten?
    if (options.flatten) {
      destPath = path.basename(destPath);
    }
    // Change the extension?
    if (options.ext) {
      destPath = destPath.replace(/(\.[^\/]*)?$/, options.ext);
    }
    // Generate destination filename.
    var dest = options.rename(destBase, destPath, options);
    // Prepend cwd to src path if necessary.
    if (options.cwd) { src = path.join(options.cwd, src); }
    // Normalize filepaths to be unix-style.
    dest = dest.replace(pathSeparatorRe, '/');
    src = src.replace(pathSeparatorRe, '/');
    // Map correct src path to dest path.
    if (fileByDest[dest]) {
      // If dest already exists, push this src onto that dest's src array.
      fileByDest[dest].src.push(src);
    } else {
      // Otherwise create a new src-dest file mapping object.
      files.push({
        src: [src],
        dest: dest,
      });
      // And store a reference for later use.
      fileByDest[dest] = files[files.length - 1];
    }
  });
  return files;
};

// reusing bits of grunt's multi-task source normalization
file.normalizeFilesArray = function(data) {
  var files = [];

  data.forEach(function(obj) {
    var prop;
    if ('src' in obj || 'dest' in obj) {
      files.push(obj);
    }
  });

  if (files.length === 0) {
    return [];
  }

  files = _(files).chain().forEach(function(obj) {
    if (!('src' in obj) || !obj.src) { return; }
    // Normalize .src properties to flattened array.
    if (Array.isArray(obj.src)) {
      obj.src = flatten(obj.src);
    } else {
      obj.src = [obj.src];
    }
  }).map(function(obj) {
    // Build options object, removing unwanted properties.
    var expandOptions = Object.assign({}, obj);
    delete expandOptions.src;
    delete expandOptions.dest;

    // Expand file mappings.
    if (obj.expand) {
      return file.expandMapping(obj.src, obj.dest, expandOptions).map(function(mapObj) {
        // Copy obj properties to result.
        var result = Object.assign({}, obj);
        // Make a clone of the orig obj available.
        result.orig = Object.assign({}, obj);
        // Set .src and .dest, processing both as templates.
        result.src = mapObj.src;
        result.dest = mapObj.dest;
        // Remove unwanted properties.
        ['expand', 'cwd', 'flatten', 'rename', 'ext'].forEach(function(prop) {
          delete result[prop];
        });
        return result;
      });
    }

    // Copy obj properties to result, adding an .orig property.
    var result = Object.assign({}, obj);
    // Make a clone of the orig obj available.
    result.orig = Object.assign({}, obj);

    if ('src' in result) {
      // Expose an expand-on-demand getter method as .src.
      Object.defineProperty(result, 'src', {
        enumerable: true,
        get: function fn() {
          var src;
          if (!('result' in fn)) {
            src = obj.src;
            // If src is an array, flatten it. Otherwise, make it into an array.
            src = Array.isArray(src) ? flatten(src) : [src];
            // Expand src files, memoizing result.
            fn.result = file.expand(expandOptions, src);
          }
          return fn.result;
        }
      });
    }

    if ('dest' in result) {
      result.dest = obj.dest;
    }

    return result;
  }).flatten().value();

  return files;
};


/***/ }),

/***/ 2072:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * archiver-utils
 *
 * Copyright (c) 2015 Chris Talkington.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/archiver-utils/blob/master/LICENSE
 */
var fs = __nccwpck_require__(7758);
var path = __nccwpck_require__(1017);
var lazystream = __nccwpck_require__(2084);
var normalizePath = __nccwpck_require__(5388);
var defaults = __nccwpck_require__(3508);

var Stream = (__nccwpck_require__(2781).Stream);
var PassThrough = (__nccwpck_require__(1642).PassThrough);

var utils = module.exports = {};
utils.file = __nccwpck_require__(1231);

utils.collectStream = function(source, callback) {
  var collection = [];
  var size = 0;

  source.on('error', callback);

  source.on('data', function(chunk) {
    collection.push(chunk);
    size += chunk.length;
  });

  source.on('end', function() {
    var buf = Buffer.alloc(size);
    var offset = 0;

    collection.forEach(function(data) {
      data.copy(buf, offset);
      offset += data.length;
    });

    callback(null, buf);
  });
};

utils.dateify = function(dateish) {
  dateish = dateish || new Date();

  if (dateish instanceof Date) {
    dateish = dateish;
  } else if (typeof dateish === 'string') {
    dateish = new Date(dateish);
  } else {
    dateish = new Date();
  }

  return dateish;
};

// this is slightly different from lodash version
utils.defaults = function(object, source, guard) {
  var args = arguments;
  args[0] = args[0] || {};

  return defaults(...args);
};

utils.isStream = function(source) {
  return source instanceof Stream;
};

utils.lazyReadStream = function(filepath) {
  return new lazystream.Readable(function() {
    return fs.createReadStream(filepath);
  });
};

utils.normalizeInputSource = function(source) {
  if (source === null) {
    return Buffer.alloc(0);
  } else if (typeof source === 'string') {
    return Buffer.from(source);
  } else if (utils.isStream(source)) {
    // Always pipe through a PassThrough stream to guarantee pausing the stream if it's already flowing,
    // since it will only be processed in a (distant) future iteration of the event loop, and will lose
    // data if already flowing now.
    return source.pipe(new PassThrough());
  }

  return source;
};

utils.sanitizePath = function(filepath) {
  return normalizePath(filepath, false).replace(/^\w+:/, '').replace(/^(\.\.\/|\/)+/, '');
};

utils.trailingSlashIt = function(str) {
  return str.slice(-1) !== '/' ? str + '/' : str;
};

utils.unixifyPath = function(filepath) {
  return normalizePath(filepath, false).replace(/^\w+:/, '');
};

utils.walkdir = function(dirpath, base, callback) {
  var results = [];

  if (typeof base === 'function') {
    callback = base;
    base = dirpath;
  }

  fs.readdir(dirpath, function(err, list) {
    var i = 0;
    var file;
    var filepath;

    if (err) {
      return callback(err);
    }

    (function next() {
      file = list[i++];

      if (!file) {
        return callback(null, results);
      }

      filepath = path.join(dirpath, file);

      fs.stat(filepath, function(err, stats) {
        results.push({
          path: filepath,
          relative: path.relative(base, filepath).replace(/\\/g, '/'),
          stats: stats
        });

        if (stats && stats.isDirectory()) {
          utils.walkdir(filepath, base, function(err, res) {
	    if(err){
	      return callback(err);
	    }

            res.forEach(function(dirEntry) {
              results.push(dirEntry);
            });
		  
            next();  
          });
        } else {
          next();
        }
      });
    })();
  });
};


/***/ }),

/***/ 8311:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var balanced = __nccwpck_require__(9417);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m) return [str];

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  if (/\$$/.test(m.pre)) {    
    for (var k = 0; k < post.length; k++) {
      var expansion = pre+ '{' + m.body + '}' + post[k];
      expansions.push(expansion);
    }
  } else {
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(',') >= 0;
    if (!isSequence && !isOptions) {
      // {a},b}
      if (m.post.match(/,.*\}/)) {
        str = m.pre + '{' + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }

    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        // x{{a,b}}y ==> x{a}y x{b}y
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }

    // at this point, n is the parts, and we know it's not a comma set
    // with a single entry.
    var N;

    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length)
      var incr = n.length == 3
        ? Math.abs(numeric(n[2]))
        : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);

      N = [];

      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === '\\')
            c = '';
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join('0');
              if (i < 0)
                c = '-' + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = [];

      for (var j = 0; j < n.length; j++) {
        N.push.apply(N, expand(n[j], false));
      }
    }

    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
  }

  return expansions;
}



/***/ }),

/***/ 4938:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

exports.setopts = setopts
exports.ownProp = ownProp
exports.makeAbs = makeAbs
exports.finish = finish
exports.mark = mark
exports.isIgnored = isIgnored
exports.childrenIgnored = childrenIgnored

function ownProp (obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field)
}

var fs = __nccwpck_require__(7147)
var path = __nccwpck_require__(1017)
var minimatch = __nccwpck_require__(8487)
var isAbsolute = (__nccwpck_require__(1017).isAbsolute)
var Minimatch = minimatch.Minimatch

function alphasort (a, b) {
  return a.localeCompare(b, 'en')
}

function setupIgnores (self, options) {
  self.ignore = options.ignore || []

  if (!Array.isArray(self.ignore))
    self.ignore = [self.ignore]

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap)
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap (pattern) {
  var gmatcher = null
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '')
    gmatcher = new Minimatch(gpattern, { dot: true })
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  }
}

function setopts (self, pattern, options) {
  if (!options)
    options = {}

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  self.windowsPathsNoEscape = !!options.windowsPathsNoEscape ||
    options.allowWindowsEscape === false
  if (self.windowsPathsNoEscape) {
    pattern = pattern.replace(/\\/g, '/')
  }

  self.silent = !!options.silent
  self.pattern = pattern
  self.strict = options.strict !== false
  self.realpath = !!options.realpath
  self.realpathCache = options.realpathCache || Object.create(null)
  self.follow = !!options.follow
  self.dot = !!options.dot
  self.mark = !!options.mark
  self.nodir = !!options.nodir
  if (self.nodir)
    self.mark = true
  self.sync = !!options.sync
  self.nounique = !!options.nounique
  self.nonull = !!options.nonull
  self.nosort = !!options.nosort
  self.nocase = !!options.nocase
  self.stat = !!options.stat
  self.noprocess = !!options.noprocess
  self.absolute = !!options.absolute
  self.fs = options.fs || fs

  self.maxLength = options.maxLength || Infinity
  self.cache = options.cache || Object.create(null)
  self.statCache = options.statCache || Object.create(null)
  self.symlinks = options.symlinks || Object.create(null)

  setupIgnores(self, options)

  self.changedCwd = false
  var cwd = process.cwd()
  if (!ownProp(options, "cwd"))
    self.cwd = path.resolve(cwd)
  else {
    self.cwd = path.resolve(options.cwd)
    self.changedCwd = self.cwd !== cwd
  }

  self.root = options.root || path.resolve(self.cwd, "/")
  self.root = path.resolve(self.root)

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd)
  self.nomount = !!options.nomount

  if (process.platform === "win32") {
    self.root = self.root.replace(/\\/g, "/")
    self.cwd = self.cwd.replace(/\\/g, "/")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")
  }

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true
  options.nocomment = true

  self.minimatch = new Minimatch(pattern, options)
  self.options = self.minimatch.options
}

function finish (self) {
  var nou = self.nounique
  var all = nou ? [] : Object.create(null)

  for (var i = 0, l = self.matches.length; i < l; i ++) {
    var matches = self.matches[i]
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i]
        if (nou)
          all.push(literal)
        else
          all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou)
        all.push.apply(all, m)
      else
        m.forEach(function (m) {
          all[m] = true
        })
    }
  }

  if (!nou)
    all = Object.keys(all)

  if (!self.nosort)
    all = all.sort(alphasort)

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i])
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !(/\/$/.test(e))
        var c = self.cache[e] || self.cache[makeAbs(self, e)]
        if (notDir && c)
          notDir = c !== 'DIR' && !Array.isArray(c)
        return notDir
      })
    }
  }

  if (self.ignore.length)
    all = all.filter(function(m) {
      return !isIgnored(self, m)
    })

  self.found = all
}

function mark (self, p) {
  var abs = makeAbs(self, p)
  var c = self.cache[abs]
  var m = p
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      var mabs = makeAbs(self, m)
      self.statCache[mabs] = self.statCache[abs]
      self.cache[mabs] = self.cache[abs]
    }
  }

  return m
}

// lotta situps...
function makeAbs (self, f) {
  var abs = f
  if (f.charAt(0) === '/') {
    abs = path.join(self.root, f)
  } else if (isAbsolute(f) || f === '') {
    abs = f
  } else if (self.changedCwd) {
    abs = path.resolve(self.cwd, f)
  } else {
    abs = path.resolve(f)
  }

  if (process.platform === 'win32')
    abs = abs.replace(/\\/g, '/')

  return abs
}


// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
  })
}

function childrenIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return !!(item.gmatcher && item.gmatcher.match(path))
  })
}


/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

module.exports = glob

var rp = __nccwpck_require__(6863)
var minimatch = __nccwpck_require__(8487)
var Minimatch = minimatch.Minimatch
var inherits = __nccwpck_require__(4124)
var EE = (__nccwpck_require__(2361).EventEmitter)
var path = __nccwpck_require__(1017)
var assert = __nccwpck_require__(9491)
var isAbsolute = (__nccwpck_require__(1017).isAbsolute)
var globSync = __nccwpck_require__(7388)
var common = __nccwpck_require__(4938)
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = __nccwpck_require__(2492)
var util = __nccwpck_require__(3837)
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = __nccwpck_require__(1223)

function glob (pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}

  if (options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return globSync(pattern, options)
  }

  return new Glob(pattern, options, cb)
}

glob.sync = globSync
var GlobSync = glob.GlobSync = globSync.GlobSync

// old api surface
glob.glob = glob

function extend (origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

glob.hasMagic = function (pattern, options_) {
  var options = extend({}, options_)
  options.noprocess = true

  var g = new Glob(pattern, options)
  var set = g.minimatch.set

  if (!pattern)
    return false

  if (set.length > 1)
    return true

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string')
      return true
  }

  return false
}

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  if (options && options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return new GlobSync(pattern, options)
  }

  if (!(this instanceof Glob))
    return new Glob(pattern, options, cb)

  setopts(this, pattern, options)
  this._didRealPath = false

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  if (typeof cb === 'function') {
    cb = once(cb)
    this.on('error', cb)
    this.on('end', function (matches) {
      cb(null, matches)
    })
  }

  var self = this
  this._processing = 0

  this._emitQueue = []
  this._processQueue = []
  this.paused = false

  if (this.noprocess)
    return this

  if (n === 0)
    return done()

  var sync = true
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false, done)
  }
  sync = false

  function done () {
    --self._processing
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish()
        })
      } else {
        self._finish()
      }
    }
  }
}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)
  if (this.aborted)
    return

  if (this.realpath && !this._didRealpath)
    return this._realpath()

  common.finish(this)
  this.emit('end', this.found)
}

Glob.prototype._realpath = function () {
  if (this._didRealpath)
    return

  this._didRealpath = true

  var n = this.matches.length
  if (n === 0)
    return this._finish()

  var self = this
  for (var i = 0; i < this.matches.length; i++)
    this._realpathSet(i, next)

  function next () {
    if (--n === 0)
      self._finish()
  }
}

Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index]
  if (!matchset)
    return cb()

  var found = Object.keys(matchset)
  var self = this
  var n = found.length

  if (n === 0)
    return cb()

  var set = this.matches[index] = Object.create(null)
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p)
    rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er)
        set[real] = true
      else if (er.syscall === 'stat')
        set[p] = true
      else
        self.emit('error', er) // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set
        cb()
      }
    })
  })
}

Glob.prototype._mark = function (p) {
  return common.mark(this, p)
}

Glob.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit('abort')
}

Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true
    this.emit('pause')
  }
}

Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume')
    this.paused = false
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0)
      this._emitQueue.length = 0
      for (var i = 0; i < eq.length; i ++) {
        var e = eq[i]
        this._emitMatch(e[0], e[1])
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0)
      this._processQueue.length = 0
      for (var i = 0; i < pq.length; i ++) {
        var p = pq[i]
        this._processing--
        this._process(p[0], p[1], p[2], p[3])
      }
    }
  }
}

Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob)
  assert(typeof cb === 'function')

  if (this.aborted)
    return

  this._processing++
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb])
    return
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) ||
      isAbsolute(pattern.map(function (p) {
        return typeof p === 'string' ? p : '[*]'
      }).join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip _processing
  if (childrenIgnored(this, read))
    return cb()

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
}

Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}

Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return cb()

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return cb()

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return cb()
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix) {
      if (prefix !== '/')
        e = prefix + '/' + e
      else
        e = prefix + e
    }
    this._process([e].concat(remain), index, inGlobStar, cb)
  }
  cb()
}

Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted)
    return

  if (isIgnored(this, e))
    return

  if (this.paused) {
    this._emitQueue.push([index, e])
    return
  }

  var abs = isAbsolute(e) ? e : this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute)
    e = abs

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  var st = this.statCache[abs]
  if (st)
    this.emit('stat', e, st)

  this.emit('match', e)
}

Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted)
    return

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false, cb)

  var lstatkey = 'lstat\0' + abs
  var self = this
  var lstatcb = inflight(lstatkey, lstatcb_)

  if (lstatcb)
    self.fs.lstat(abs, lstatcb)

  function lstatcb_ (er, lstat) {
    if (er && er.code === 'ENOENT')
      return cb()

    var isSym = lstat && lstat.isSymbolicLink()
    self.symlinks[abs] = isSym

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE'
      cb()
    } else
      self._readdir(abs, false, cb)
  }
}

Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted)
    return

  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
  if (!cb)
    return

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs, cb)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return cb()

    if (Array.isArray(c))
      return cb(null, c)
  }

  var self = this
  self.fs.readdir(abs, readdirCb(this, abs, cb))
}

function readdirCb (self, abs, cb) {
  return function (er, entries) {
    if (er)
      self._readdirError(abs, er, cb)
    else
      self._readdirEntries(abs, entries, cb)
  }
}

Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted)
    return

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries
  return cb(null, entries)
}

Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted)
    return

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        this.emit('error', error)
        this.abort()
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict) {
        this.emit('error', er)
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort()
      }
      if (!this.silent)
        console.error('glob error', er)
      break
  }

  return cb()
}

Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}


Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return cb()

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb)

  var isSym = this.symlinks[abs]
  var len = entries.length

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return cb()

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true, cb)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true, cb)
  }

  cb()
}

Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb)
  })
}
Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return cb()

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
  cb()
}

// Returns either 'DIR', 'FILE', or false
Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return cb()

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return cb(null, c)

    if (needDir && c === 'FILE')
      return cb()

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (stat !== undefined) {
    if (stat === false)
      return cb(null, stat)
    else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE'
      if (needDir && type === 'FILE')
        return cb()
      else
        return cb(null, type, stat)
    }
  }

  var self = this
  var statcb = inflight('stat\0' + abs, lstatcb_)
  if (statcb)
    self.fs.lstat(abs, statcb)

  function lstatcb_ (er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return self.fs.stat(abs, function (er, stat) {
        if (er)
          self._stat2(f, abs, null, lstat, cb)
        else
          self._stat2(f, abs, er, stat, cb)
      })
    } else {
      self._stat2(f, abs, er, lstat, cb)
    }
  }
}

Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false
    return cb()
  }

  var needDir = f.slice(-1) === '/'
  this.statCache[abs] = stat

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
    return cb(null, false, stat)

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'
  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return cb()

  return cb(null, c, stat)
}


/***/ }),

/***/ 7388:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = globSync
globSync.GlobSync = GlobSync

var rp = __nccwpck_require__(6863)
var minimatch = __nccwpck_require__(8487)
var Minimatch = minimatch.Minimatch
var Glob = (__nccwpck_require__(95).Glob)
var util = __nccwpck_require__(3837)
var path = __nccwpck_require__(1017)
var assert = __nccwpck_require__(9491)
var isAbsolute = (__nccwpck_require__(1017).isAbsolute)
var common = __nccwpck_require__(4938)
var setopts = common.setopts
var ownProp = common.ownProp
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

function globSync (pattern, options) {
  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  return new GlobSync(pattern, options).found
}

function GlobSync (pattern, options) {
  if (!pattern)
    throw new Error('must provide pattern')

  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  if (!(this instanceof GlobSync))
    return new GlobSync(pattern, options)

  setopts(this, pattern, options)

  if (this.noprocess)
    return this

  var n = this.minimatch.set.length
  this.matches = new Array(n)
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false)
  }
  this._finish()
}

GlobSync.prototype._finish = function () {
  assert.ok(this instanceof GlobSync)
  if (this.realpath) {
    var self = this
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null)
      for (var p in matchset) {
        try {
          p = self._makeAbs(p)
          var real = rp.realpathSync(p, self.realpathCache)
          set[real] = true
        } catch (er) {
          if (er.syscall === 'stat')
            set[self._makeAbs(p)] = true
          else
            throw er
        }
      }
    })
  }
  common.finish(this)
}


GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  assert.ok(this instanceof GlobSync)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) ||
      isAbsolute(pattern.map(function (p) {
        return typeof p === 'string' ? p : '[*]'
      }).join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip processing
  if (childrenIgnored(this, read))
    return

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
}


GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar)

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix.slice(-1) !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix)
      newPattern = [prefix, e]
    else
      newPattern = [e]
    this._process(newPattern.concat(remain), index, inGlobStar)
  }
}


GlobSync.prototype._emitMatch = function (index, e) {
  if (isIgnored(this, e))
    return

  var abs = this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute) {
    e = abs
  }

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  if (this.stat)
    this._stat(e)
}


GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false)

  var entries
  var lstat
  var stat
  try {
    lstat = this.fs.lstatSync(abs)
  } catch (er) {
    if (er.code === 'ENOENT') {
      // lstat failed, doesn't exist
      return null
    }
  }

  var isSym = lstat && lstat.isSymbolicLink()
  this.symlinks[abs] = isSym

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && lstat && !lstat.isDirectory())
    this.cache[abs] = 'FILE'
  else
    entries = this._readdir(abs, false)

  return entries
}

GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries

  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return null

    if (Array.isArray(c))
      return c
  }

  try {
    return this._readdirEntries(abs, this.fs.readdirSync(abs))
  } catch (er) {
    this._readdirError(abs, er)
    return null
  }
}

GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries

  // mark and cache dir-ness
  return entries
}

GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        throw error
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict)
        throw er
      if (!this.silent)
        console.error('glob error', er)
      break
  }
}

GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false)

  var len = entries.length
  var isSym = this.symlinks[abs]

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true)
  }
}

GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
}

// Returns either 'DIR', 'FILE', or false
GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return false

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return c

    if (needDir && c === 'FILE')
      return false

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (!stat) {
    var lstat
    try {
      lstat = this.fs.lstatSync(abs)
    } catch (er) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false
        return false
      }
    }

    if (lstat && lstat.isSymbolicLink()) {
      try {
        stat = this.fs.statSync(abs)
      } catch (er) {
        stat = lstat
      }
    } else {
      stat = lstat
    }
  }

  this.statCache[abs] = stat

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'

  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return false

  return c
}

GlobSync.prototype._mark = function (p) {
  return common.mark(this, p)
}

GlobSync.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}


/***/ }),

/***/ 3656:
/***/ ((module) => {

const isWindows = typeof process === 'object' &&
  process &&
  process.platform === 'win32'
module.exports = isWindows ? { sep: '\\' } : { sep: '/' }


/***/ }),

/***/ 8487:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const minimatch = module.exports = (p, pattern, options = {}) => {
  assertValidPattern(pattern)

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  return new Minimatch(pattern, options).match(p)
}

module.exports = minimatch

const path = __nccwpck_require__(3656)
minimatch.sep = path.sep

const GLOBSTAR = Symbol('globstar **')
minimatch.GLOBSTAR = GLOBSTAR
const expand = __nccwpck_require__(8311)

const plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
const qmark = '[^/]'

// * => any number of characters
const star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
const twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
const twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// "abc" -> { a:true, b:true, c:true }
const charSet = s => s.split('').reduce((set, c) => {
  set[c] = true
  return set
}, {})

// characters that need to be escaped in RegExp.
const reSpecials = charSet('().*{}+?[]^$\\!')

// characters that indicate we have to add the pattern start
const addPatternStartSet = charSet('[.(')

// normalizes slashes.
const slashSplit = /\/+/

minimatch.filter = (pattern, options = {}) =>
  (p, i, list) => minimatch(p, pattern, options)

const ext = (a, b = {}) => {
  const t = {}
  Object.keys(a).forEach(k => t[k] = a[k])
  Object.keys(b).forEach(k => t[k] = b[k])
  return t
}

minimatch.defaults = def => {
  if (!def || typeof def !== 'object' || !Object.keys(def).length) {
    return minimatch
  }

  const orig = minimatch

  const m = (p, pattern, options) => orig(p, pattern, ext(def, options))
  m.Minimatch = class Minimatch extends orig.Minimatch {
    constructor (pattern, options) {
      super(pattern, ext(def, options))
    }
  }
  m.Minimatch.defaults = options => orig.defaults(ext(def, options)).Minimatch
  m.filter = (pattern, options) => orig.filter(pattern, ext(def, options))
  m.defaults = options => orig.defaults(ext(def, options))
  m.makeRe = (pattern, options) => orig.makeRe(pattern, ext(def, options))
  m.braceExpand = (pattern, options) => orig.braceExpand(pattern, ext(def, options))
  m.match = (list, pattern, options) => orig.match(list, pattern, ext(def, options))

  return m
}





// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = (pattern, options) => braceExpand(pattern, options)

const braceExpand = (pattern, options = {}) => {
  assertValidPattern(pattern)

  // Thanks to Yeting Li <https://github.com/yetingli> for
  // improving this regexp to avoid a ReDOS vulnerability.
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

const MAX_PATTERN_LENGTH = 1024 * 64
const assertValidPattern = pattern => {
  if (typeof pattern !== 'string') {
    throw new TypeError('invalid pattern')
  }

  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError('pattern is too long')
  }
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
const SUBPARSE = Symbol('subparse')

minimatch.makeRe = (pattern, options) =>
  new Minimatch(pattern, options || {}).makeRe()

minimatch.match = (list, pattern, options = {}) => {
  const mm = new Minimatch(pattern, options)
  list = list.filter(f => mm.match(f))
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

// replace stuff like \* with *
const globUnescape = s => s.replace(/\\(.)/g, '$1')
const charUnescape = s => s.replace(/\\([^-\]])/g, '$1')
const regExpEscape = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const braExpEscape = s => s.replace(/[[\]\\]/g, '\\$&')

class Minimatch {
  constructor (pattern, options) {
    assertValidPattern(pattern)

    if (!options) options = {}

    this.options = options
    this.set = []
    this.pattern = pattern
    this.windowsPathsNoEscape = !!options.windowsPathsNoEscape ||
      options.allowWindowsEscape === false
    if (this.windowsPathsNoEscape) {
      this.pattern = this.pattern.replace(/\\/g, '/')
    }
    this.regexp = null
    this.negate = false
    this.comment = false
    this.empty = false
    this.partial = !!options.partial

    // make the set of regexps etc.
    this.make()
  }

  debug () {}

  make () {
    const pattern = this.pattern
    const options = this.options

    // empty patterns and comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
      this.comment = true
      return
    }
    if (!pattern) {
      this.empty = true
      return
    }

    // step 1: figure out negation, etc.
    this.parseNegate()

    // step 2: expand braces
    let set = this.globSet = this.braceExpand()

    if (options.debug) this.debug = (...args) => console.error(...args)

    this.debug(this.pattern, set)

    // step 3: now we have a set, so turn each one into a series of path-portion
    // matching patterns.
    // These will be regexps, except in the case of "**", which is
    // set to the GLOBSTAR object for globstar behavior,
    // and will not contain any / characters
    set = this.globParts = set.map(s => s.split(slashSplit))

    this.debug(this.pattern, set)

    // glob --> regexps
    set = set.map((s, si, set) => s.map(this.parse, this))

    this.debug(this.pattern, set)

    // filter out everything that didn't compile properly.
    set = set.filter(s => s.indexOf(false) === -1)

    this.debug(this.pattern, set)

    this.set = set
  }

  parseNegate () {
    if (this.options.nonegate) return

    const pattern = this.pattern
    let negate = false
    let negateOffset = 0

    for (let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++) {
      negate = !negate
      negateOffset++
    }

    if (negateOffset) this.pattern = pattern.slice(negateOffset)
    this.negate = negate
  }

  // set partial to true to test if, for example,
  // "/a/b" matches the start of "/*/b/*/d"
  // Partial means, if you run out of file before you run
  // out of pattern, then that's fine, as long as all
  // the parts match.
  matchOne (file, pattern, partial) {
    var options = this.options

    this.debug('matchOne',
      { 'this': this, file: file, pattern: pattern })

    this.debug('matchOne', file.length, pattern.length)

    for (var fi = 0,
        pi = 0,
        fl = file.length,
        pl = pattern.length
        ; (fi < fl) && (pi < pl)
        ; fi++, pi++) {
      this.debug('matchOne loop')
      var p = pattern[pi]
      var f = file[fi]

      this.debug(pattern, p, f)

      // should be impossible.
      // some invalid regexp stuff in the set.
      /* istanbul ignore if */
      if (p === false) return false

      if (p === GLOBSTAR) {
        this.debug('GLOBSTAR', [pattern, p, f])

        // "**"
        // a/**/b/**/c would match the following:
        // a/b/x/y/z/c
        // a/x/y/z/b/c
        // a/b/x/b/x/c
        // a/b/c
        // To do this, take the rest of the pattern after
        // the **, and see if it would match the file remainder.
        // If so, return success.
        // If not, the ** "swallows" a segment, and try again.
        // This is recursively awful.
        //
        // a/**/b/**/c matching a/b/x/y/z/c
        // - a matches a
        // - doublestar
        //   - matchOne(b/x/y/z/c, b/**/c)
        //     - b matches b
        //     - doublestar
        //       - matchOne(x/y/z/c, c) -> no
        //       - matchOne(y/z/c, c) -> no
        //       - matchOne(z/c, c) -> no
        //       - matchOne(c, c) yes, hit
        var fr = fi
        var pr = pi + 1
        if (pr === pl) {
          this.debug('** at the end')
          // a ** at the end will just swallow the rest.
          // We have found a match.
          // however, it will not swallow /.x, unless
          // options.dot is set.
          // . and .. are *never* matched by **, for explosively
          // exponential reasons.
          for (; fi < fl; fi++) {
            if (file[fi] === '.' || file[fi] === '..' ||
              (!options.dot && file[fi].charAt(0) === '.')) return false
          }
          return true
        }

        // ok, let's see if we can swallow whatever we can.
        while (fr < fl) {
          var swallowee = file[fr]

          this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

          // XXX remove this slice.  Just pass the start index.
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug('globstar found match!', fr, fl, swallowee)
            // found a match.
            return true
          } else {
            // can't swallow "." or ".." ever.
            // can only swallow ".foo" when explicitly asked.
            if (swallowee === '.' || swallowee === '..' ||
              (!options.dot && swallowee.charAt(0) === '.')) {
              this.debug('dot detected!', file, fr, pattern, pr)
              break
            }

            // ** swallows a segment, and continue.
            this.debug('globstar swallow a segment, and continue')
            fr++
          }
        }

        // no match was found.
        // However, in partial mode, we can't say this is necessarily over.
        // If there's more *pattern* left, then
        /* istanbul ignore if */
        if (partial) {
          // ran out of file
          this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
          if (fr === fl) return true
        }
        return false
      }

      // something other than **
      // non-magic patterns just have to match exactly
      // patterns with magic have been turned into regexps.
      var hit
      if (typeof p === 'string') {
        hit = f === p
        this.debug('string match', p, f, hit)
      } else {
        hit = f.match(p)
        this.debug('pattern match', p, f, hit)
      }

      if (!hit) return false
    }

    // Note: ending in / means that we'll get a final ""
    // at the end of the pattern.  This can only match a
    // corresponding "" at the end of the file.
    // If the file ends in /, then it can only match a
    // a pattern that ends in /, unless the pattern just
    // doesn't have any more for it. But, a/b/ should *not*
    // match "a/b/*", even though "" matches against the
    // [^/]*? pattern, except in partial mode, where it might
    // simply not be reached yet.
    // However, a/b/ should still satisfy a/*

    // now either we fell off the end of the pattern, or we're done.
    if (fi === fl && pi === pl) {
      // ran out of pattern and filename at the same time.
      // an exact hit!
      return true
    } else if (fi === fl) {
      // ran out of file, but still had pattern left.
      // this is ok if we're doing the match as part of
      // a glob fs traversal.
      return partial
    } else /* istanbul ignore else */ if (pi === pl) {
      // ran out of pattern, still have file left.
      // this is only acceptable if we're on the very last
      // empty segment of a file with a trailing slash.
      // a/* should match a/b/
      return (fi === fl - 1) && (file[fi] === '')
    }

    // should be unreachable.
    /* istanbul ignore next */
    throw new Error('wtf?')
  }

  braceExpand () {
    return braceExpand(this.pattern, this.options)
  }

  parse (pattern, isSub) {
    assertValidPattern(pattern)

    const options = this.options

    // shortcuts
    if (pattern === '**') {
      if (!options.noglobstar)
        return GLOBSTAR
      else
        pattern = '*'
    }
    if (pattern === '') return ''

    let re = ''
    let hasMagic = false
    let escaping = false
    // ? => one single character
    const patternListStack = []
    const negativeLists = []
    let stateChar
    let inClass = false
    let reClassStart = -1
    let classStart = -1
    let cs
    let pl
    let sp
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.  However, if the pattern
    // starts with ., then traversal patterns can match.
    let dotTravAllowed = pattern.charAt(0) === '.'
    let dotFileAllowed = options.dot || dotTravAllowed
    const patternStart = () =>
      dotTravAllowed
        ? ''
        : dotFileAllowed
        ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))'
        : '(?!\\.)'
    const subPatternStart = (p) =>
      p.charAt(0) === '.'
        ? ''
        : options.dot
        ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))'
        : '(?!\\.)'


    const clearStateChar = () => {
      if (stateChar) {
        // we had some state-tracking character
        // that wasn't consumed by this pass.
        switch (stateChar) {
          case '*':
            re += star
            hasMagic = true
          break
          case '?':
            re += qmark
            hasMagic = true
          break
          default:
            re += '\\' + stateChar
          break
        }
        this.debug('clearStateChar %j %j', stateChar, re)
        stateChar = false
      }
    }

    for (let i = 0, c; (i < pattern.length) && (c = pattern.charAt(i)); i++) {
      this.debug('%s\t%s %s %j', pattern, i, re, c)

      // skip over any that are escaped.
      if (escaping) {
        /* istanbul ignore next - completely not allowed, even escaped. */
        if (c === '/') {
          return false
        }

        if (reSpecials[c]) {
          re += '\\'
        }
        re += c
        escaping = false
        continue
      }

      switch (c) {
        /* istanbul ignore next */
        case '/': {
          // Should already be path-split by now.
          return false
        }

        case '\\':
          if (inClass && pattern.charAt(i + 1) === '-') {
            re += c
            continue
          }

          clearStateChar()
          escaping = true
        continue

        // the various stateChar values
        // for the "extglob" stuff.
        case '?':
        case '*':
        case '+':
        case '@':
        case '!':
          this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

          // all of those are literals inside a class, except that
          // the glob [!a] means [^a] in regexp
          if (inClass) {
            this.debug('  in class')
            if (c === '!' && i === classStart + 1) c = '^'
            re += c
            continue
          }

          // if we already have a stateChar, then it means
          // that there was something like ** or +? in there.
          // Handle the stateChar, then proceed with this one.
          this.debug('call clearStateChar %j', stateChar)
          clearStateChar()
          stateChar = c
          // if extglob is disabled, then +(asdf|foo) isn't a thing.
          // just clear the statechar *now*, rather than even diving into
          // the patternList stuff.
          if (options.noext) clearStateChar()
        continue

        case '(': {
          if (inClass) {
            re += '('
            continue
          }

          if (!stateChar) {
            re += '\\('
            continue
          }

          const plEntry = {
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close,
          }
          this.debug(this.pattern, '\t', plEntry)
          patternListStack.push(plEntry)
          // negation is (?:(?!(?:js)(?:<rest>))[^/]*)
          re += plEntry.open
          // next entry starts with a dot maybe?
          if (plEntry.start === 0 && plEntry.type !== '!') {
            dotTravAllowed = true
            re += subPatternStart(pattern.slice(i + 1))
          }
          this.debug('plType %j %j', stateChar, re)
          stateChar = false
          continue
        }

        case ')': {
          const plEntry = patternListStack[patternListStack.length - 1]
          if (inClass || !plEntry) {
            re += '\\)'
            continue
          }
          patternListStack.pop()

          // closing an extglob
          clearStateChar()
          hasMagic = true
          pl = plEntry
          // negation is (?:(?!js)[^/]*)
          // The others are (?:<pattern>)<type>
          re += pl.close
          if (pl.type === '!') {
            negativeLists.push(Object.assign(pl, { reEnd: re.length }))
          }
          continue
        }

        case '|': {
          const plEntry = patternListStack[patternListStack.length - 1]
          if (inClass || !plEntry) {
            re += '\\|'
            continue
          }

          clearStateChar()
          re += '|'
          // next subpattern can start with a dot?
          if (plEntry.start === 0 && plEntry.type !== '!') {
            dotTravAllowed = true
            re += subPatternStart(pattern.slice(i + 1))
          }
          continue
        }

        // these are mostly the same in regexp and glob
        case '[':
          // swallow any state-tracking char before the [
          clearStateChar()

          if (inClass) {
            re += '\\' + c
            continue
          }

          inClass = true
          classStart = i
          reClassStart = re.length
          re += c
        continue

        case ']':
          //  a right bracket shall lose its special
          //  meaning and represent itself in
          //  a bracket expression if it occurs
          //  first in the list.  -- POSIX.2 2.8.3.2
          if (i === classStart + 1 || !inClass) {
            re += '\\' + c
            continue
          }

          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + braExpEscape(charUnescape(cs)) + ']')
            // looks good, finish up the class.
            re += c
          } catch (er) {
            // out of order ranges in JS are errors, but in glob syntax,
            // they're just a range that matches nothing.
            re = re.substring(0, reClassStart) + '(?:$.)' // match nothing ever
          }
          hasMagic = true
          inClass = false
        continue

        default:
          // swallow any state char that wasn't consumed
          clearStateChar()

          if (reSpecials[c] && !(c === '^' && inClass)) {
            re += '\\'
          }

          re += c
          break

      } // switch
    } // for

    // handle the case where we left a class open.
    // "[abc" is valid, equivalent to "\[abc"
    if (inClass) {
      // split where the last [ was, and escape it
      // this is a huge pita.  We now have to re-walk
      // the contents of the would-be class to re-translate
      // any characters that were passed through as-is
      cs = pattern.slice(classStart + 1)
      sp = this.parse(cs, SUBPARSE)
      re = re.substring(0, reClassStart) + '\\[' + sp[0]
      hasMagic = hasMagic || sp[1]
    }

    // handle the case where we had a +( thing at the *end*
    // of the pattern.
    // each pattern list stack adds 3 chars, and we need to go through
    // and escape any | chars that were passed through as-is for the regexp.
    // Go through and escape them, taking care not to double-escape any
    // | chars that were already escaped.
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      let tail
      tail = re.slice(pl.reStart + pl.open.length)
      this.debug('setting tail', re, pl)
      // maybe some even number of \, then maybe 1 \, followed by a |
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_, $1, $2) => {
        /* istanbul ignore else - should already be done */
        if (!$2) {
          // the | isn't already escaped, so escape it.
          $2 = '\\'
        }

        // need to escape all those slashes *again*, without escaping the
        // one that we need for escaping the | character.  As it works out,
        // escaping an even number of slashes can be done by simply repeating
        // it exactly after itself.  That's why this trick works.
        //
        // I am sorry that you have to see this.
        return $1 + $1 + $2 + '|'
      })

      this.debug('tail=%j\n   %s', tail, tail, pl, re)
      const t = pl.type === '*' ? star
        : pl.type === '?' ? qmark
        : '\\' + pl.type

      hasMagic = true
      re = re.slice(0, pl.reStart) + t + '\\(' + tail
    }

    // handle trailing things that only matter at the very end.
    clearStateChar()
    if (escaping) {
      // trailing \\
      re += '\\\\'
    }

    // only need to apply the nodot start if the re starts with
    // something that could conceivably capture a dot
    const addPatternStart = addPatternStartSet[re.charAt(0)]

    // Hack to work around lack of negative lookbehind in JS
    // A pattern like: *.!(x).!(y|z) needs to ensure that a name
    // like 'a.xyz.yz' doesn't match.  So, the first negative
    // lookahead, has to look ALL the way ahead, to the end of
    // the pattern.
    for (let n = negativeLists.length - 1; n > -1; n--) {
      const nl = negativeLists[n]

      const nlBefore = re.slice(0, nl.reStart)
      const nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
      let nlAfter = re.slice(nl.reEnd)
      const nlLast = re.slice(nl.reEnd - 8, nl.reEnd) + nlAfter

      // Handle nested stuff like *(*.js|!(*.json)), where open parens
      // mean that we should *not* include the ) in the bit that is considered
      // "after" the negated section.
      const closeParensBefore = nlBefore.split(')').length
      const openParensBefore = nlBefore.split('(').length - closeParensBefore
      let cleanAfter = nlAfter
      for (let i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
      }
      nlAfter = cleanAfter

      const dollar = nlAfter === '' && isSub !== SUBPARSE ? '(?:$|\\/)' : ''

      re = nlBefore + nlFirst + nlAfter + dollar + nlLast
    }

    // if the re is not "" at this point, then we need to make sure
    // it doesn't match against an empty path part.
    // Otherwise a/* will match a/, which it should not.
    if (re !== '' && hasMagic) {
      re = '(?=.)' + re
    }

    if (addPatternStart) {
      re = patternStart() + re
    }

    // parsing just a piece of a larger pattern.
    if (isSub === SUBPARSE) {
      return [re, hasMagic]
    }

    // if it's nocase, and the lcase/uppercase don't match, it's magic
    if (options.nocase && !hasMagic) {
      hasMagic = pattern.toUpperCase() !== pattern.toLowerCase()
    }

    // skip the regexp for non-magical patterns
    // unescape anything in it, though, so that it'll be
    // an exact match against a file etc.
    if (!hasMagic) {
      return globUnescape(pattern)
    }

    const flags = options.nocase ? 'i' : ''
    try {
      return Object.assign(new RegExp('^' + re + '$', flags), {
        _glob: pattern,
        _src: re,
      })
    } catch (er) /* istanbul ignore next - should be impossible */ {
      // If it was an invalid regular expression, then it can't match
      // anything.  This trick looks for a character after the end of
      // the string, which is of course impossible, except in multi-line
      // mode, but it's not a /m regex.
      return new RegExp('$.')
    }
  }

  makeRe () {
    if (this.regexp || this.regexp === false) return this.regexp

    // at this point, this.set is a 2d array of partial
    // pattern strings, or "**".
    //
    // It's better to use .match().  This function shouldn't
    // be used, really, but it's pretty convenient sometimes,
    // when you just want to work with a regex.
    const set = this.set

    if (!set.length) {
      this.regexp = false
      return this.regexp
    }
    const options = this.options

    const twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot
    const flags = options.nocase ? 'i' : ''

    // coalesce globstars and regexpify non-globstar patterns
    // if it's the only item, then we just do one twoStar
    // if it's the first, and there are more, prepend (\/|twoStar\/)? to next
    // if it's the last, append (\/twoStar|) to previous
    // if it's in the middle, append (\/|\/twoStar\/) to previous
    // then filter out GLOBSTAR symbols
    let re = set.map(pattern => {
      pattern = pattern.map(p =>
        typeof p === 'string' ? regExpEscape(p)
        : p === GLOBSTAR ? GLOBSTAR
        : p._src
      ).reduce((set, p) => {
        if (!(set[set.length - 1] === GLOBSTAR && p === GLOBSTAR)) {
          set.push(p)
        }
        return set
      }, [])
      pattern.forEach((p, i) => {
        if (p !== GLOBSTAR || pattern[i-1] === GLOBSTAR) {
          return
        }
        if (i === 0) {
          if (pattern.length > 1) {
            pattern[i+1] = '(?:\\\/|' + twoStar + '\\\/)?' + pattern[i+1]
          } else {
            pattern[i] = twoStar
          }
        } else if (i === pattern.length - 1) {
          pattern[i-1] += '(?:\\\/|' + twoStar + ')?'
        } else {
          pattern[i-1] += '(?:\\\/|\\\/' + twoStar + '\\\/)' + pattern[i+1]
          pattern[i+1] = GLOBSTAR
        }
      })
      return pattern.filter(p => p !== GLOBSTAR).join('/')
    }).join('|')

    // must match entire pattern
    // ending in a * or ** will make it less strict.
    re = '^(?:' + re + ')$'

    // can match anything, as long as it's not this.
    if (this.negate) re = '^(?!' + re + ').*$'

    try {
      this.regexp = new RegExp(re, flags)
    } catch (ex) /* istanbul ignore next - should be impossible */ {
      this.regexp = false
    }
    return this.regexp
  }

  match (f, partial = this.partial) {
    this.debug('match', f, this.pattern)
    // short-circuit in the case of busted things.
    // comments, etc.
    if (this.comment) return false
    if (this.empty) return f === ''

    if (f === '/' && partial) return true

    const options = this.options

    // windows: need to use /, not \
    if (path.sep !== '/') {
      f = f.split(path.sep).join('/')
    }

    // treat the test path as a set of pathparts.
    f = f.split(slashSplit)
    this.debug(this.pattern, 'split', f)

    // just ONE of the pattern sets in this.set needs to match
    // in order for it to be valid.  If negating, then just one
    // match means that we have failed.
    // Either way, return on the first hit.

    const set = this.set
    this.debug(this.pattern, 'set', set)

    // Find the basename of the path by looking for the last non-empty segment
    let filename
    for (let i = f.length - 1; i >= 0; i--) {
      filename = f[i]
      if (filename) break
    }

    for (let i = 0; i < set.length; i++) {
      const pattern = set[i]
      let file = f
      if (options.matchBase && pattern.length === 1) {
        file = [filename]
      }
      const hit = this.matchOne(file, pattern, partial)
      if (hit) {
        if (options.flipNegate) return true
        return !this.negate
      }
    }

    // didn't get any hits.  this is success if it's a negative
    // pattern, failure otherwise.
    if (options.flipNegate) return false
    return this.negate
  }

  static defaults (def) {
    return minimatch.defaults(def).Minimatch
  }
}

minimatch.Minimatch = Minimatch


/***/ }),

/***/ 3084:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Archiver Vending
 *
 * @ignore
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
var Archiver = __nccwpck_require__(5010);

var formats = {};

/**
 * Dispenses a new Archiver instance.
 *
 * @constructor
 * @param  {String} format The archive format to use.
 * @param  {Object} options See [Archiver]{@link Archiver}
 * @return {Archiver}
 */
var vending = function(format, options) {
  return vending.create(format, options);
};

/**
 * Creates a new Archiver instance.
 *
 * @param  {String} format The archive format to use.
 * @param  {Object} options See [Archiver]{@link Archiver}
 * @return {Archiver}
 */
vending.create = function(format, options) {
  if (formats[format]) {
    var instance = new Archiver(format, options);
    instance.setFormat(format);
    instance.setModule(new formats[format](options));

    return instance;
  } else {
    throw new Error('create(' + format + '): format not registered');
  }
};

/**
 * Registers a format for use with archiver.
 *
 * @param  {String} format The name of the format.
 * @param  {Function} module The function for archiver to interact with.
 * @return void
 */
vending.registerFormat = function(format, module) {
  if (formats[format]) {
    throw new Error('register(' + format + '): format already registered');
  }

  if (typeof module !== 'function') {
    throw new Error('register(' + format + '): format module invalid');
  }

  if (typeof module.prototype.append !== 'function' || typeof module.prototype.finalize !== 'function') {
    throw new Error('register(' + format + '): format module missing methods');
  }

  formats[format] = module;
};

/**
 * Check if the format is already registered.
 * 
 * @param {String} format the name of the format.
 * @return boolean
 */
vending.isRegisteredFormat = function (format) {
  if (formats[format]) {
    return true;
  }
  
  return false;
};

vending.registerFormat('zip', __nccwpck_require__(8987));
vending.registerFormat('tar', __nccwpck_require__(3614));
vending.registerFormat('json', __nccwpck_require__(9827));

module.exports = vending;

/***/ }),

/***/ 5010:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Archiver Core
 *
 * @ignore
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
var fs = __nccwpck_require__(7147);
var glob = __nccwpck_require__(7978);
var async = __nccwpck_require__(7888);
var path = __nccwpck_require__(1017);
var util = __nccwpck_require__(2072);

var inherits = (__nccwpck_require__(3837).inherits);
var ArchiverError = __nccwpck_require__(3143);
var Transform = (__nccwpck_require__(1642).Transform);

var win32 = process.platform === 'win32';

/**
 * @constructor
 * @param {String} format The archive format to use.
 * @param {(CoreOptions|TransformOptions)} options See also {@link ZipOptions} and {@link TarOptions}.
 */
var Archiver = function(format, options) {
  if (!(this instanceof Archiver)) {
    return new Archiver(format, options);
  }

  if (typeof format !== 'string') {
    options = format;
    format = 'zip';
  }

  options = this.options = util.defaults(options, {
    highWaterMark: 1024 * 1024,
    statConcurrency: 4
  });

  Transform.call(this, options);

  this._format = false;
  this._module = false;
  this._pending = 0;
  this._pointer = 0;

  this._entriesCount = 0;
  this._entriesProcessedCount = 0;
  this._fsEntriesTotalBytes = 0;
  this._fsEntriesProcessedBytes = 0;

  this._queue = async.queue(this._onQueueTask.bind(this), 1);
  this._queue.drain(this._onQueueDrain.bind(this));

  this._statQueue = async.queue(this._onStatQueueTask.bind(this), options.statConcurrency);
  this._statQueue.drain(this._onQueueDrain.bind(this));

  this._state = {
    aborted: false,
    finalize: false,
    finalizing: false,
    finalized: false,
    modulePiped: false
  };

  this._streams = [];
};

inherits(Archiver, Transform);

/**
 * Internal logic for `abort`.
 *
 * @private
 * @return void
 */
Archiver.prototype._abort = function() {
  this._state.aborted = true;
  this._queue.kill();
  this._statQueue.kill();

  if (this._queue.idle()) {
    this._shutdown();
  }
};

/**
 * Internal helper for appending files.
 *
 * @private
 * @param  {String} filepath The source filepath.
 * @param  {EntryData} data The entry data.
 * @return void
 */
Archiver.prototype._append = function(filepath, data) {
  data = data || {};

  var task = {
    source: null,
    filepath: filepath
  };

  if (!data.name) {
    data.name = filepath;
  }

  data.sourcePath = filepath;
  task.data = data;
  this._entriesCount++;

  if (data.stats && data.stats instanceof fs.Stats) {
    task = this._updateQueueTaskWithStats(task, data.stats);
    if (task) {
      if (data.stats.size) {
        this._fsEntriesTotalBytes += data.stats.size;
      }

      this._queue.push(task);
    }
  } else {
    this._statQueue.push(task);
  }
};

/**
 * Internal logic for `finalize`.
 *
 * @private
 * @return void
 */
Archiver.prototype._finalize = function() {
  if (this._state.finalizing || this._state.finalized || this._state.aborted) {
    return;
  }

  this._state.finalizing = true;

  this._moduleFinalize();

  this._state.finalizing = false;
  this._state.finalized = true;
};

/**
 * Checks the various state variables to determine if we can `finalize`.
 *
 * @private
 * @return {Boolean}
 */
Archiver.prototype._maybeFinalize = function() {
  if (this._state.finalizing || this._state.finalized || this._state.aborted) {
    return false;
  }

  if (this._state.finalize && this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
    this._finalize();
    return true;
  }

  return false;
};

/**
 * Appends an entry to the module.
 *
 * @private
 * @fires  Archiver#entry
 * @param  {(Buffer|Stream)} source
 * @param  {EntryData} data
 * @param  {Function} callback
 * @return void
 */
Archiver.prototype._moduleAppend = function(source, data, callback) {
  if (this._state.aborted) {
    callback();
    return;
  }

  this._module.append(source, data, function(err) {
    this._task = null;

    if (this._state.aborted) {
      this._shutdown();
      return;
    }

    if (err) {
      this.emit('error', err);
      setImmediate(callback);
      return;
    }

    /**
     * Fires when the entry's input has been processed and appended to the archive.
     *
     * @event Archiver#entry
     * @type {EntryData}
     */
    this.emit('entry', data);
    this._entriesProcessedCount++;

    if (data.stats && data.stats.size) {
      this._fsEntriesProcessedBytes += data.stats.size;
    }

    /**
     * @event Archiver#progress
     * @type {ProgressData}
     */
    this.emit('progress', {
      entries: {
        total: this._entriesCount,
        processed: this._entriesProcessedCount
      },
      fs: {
        totalBytes: this._fsEntriesTotalBytes,
        processedBytes: this._fsEntriesProcessedBytes
      }
    });

    setImmediate(callback);
  }.bind(this));
};

/**
 * Finalizes the module.
 *
 * @private
 * @return void
 */
Archiver.prototype._moduleFinalize = function() {
  if (typeof this._module.finalize === 'function') {
    this._module.finalize();
  } else if (typeof this._module.end === 'function') {
    this._module.end();
  } else {
    this.emit('error', new ArchiverError('NOENDMETHOD'));
  }
};

/**
 * Pipes the module to our internal stream with error bubbling.
 *
 * @private
 * @return void
 */
Archiver.prototype._modulePipe = function() {
  this._module.on('error', this._onModuleError.bind(this));
  this._module.pipe(this);
  this._state.modulePiped = true;
};

/**
 * Determines if the current module supports a defined feature.
 *
 * @private
 * @param  {String} key
 * @return {Boolean}
 */
Archiver.prototype._moduleSupports = function(key) {
  if (!this._module.supports || !this._module.supports[key]) {
    return false;
  }

  return this._module.supports[key];
};

/**
 * Unpipes the module from our internal stream.
 *
 * @private
 * @return void
 */
Archiver.prototype._moduleUnpipe = function() {
  this._module.unpipe(this);
  this._state.modulePiped = false;
};

/**
 * Normalizes entry data with fallbacks for key properties.
 *
 * @private
 * @param  {Object} data
 * @param  {fs.Stats} stats
 * @return {Object}
 */
Archiver.prototype._normalizeEntryData = function(data, stats) {
  data = util.defaults(data, {
    type: 'file',
    name: null,
    date: null,
    mode: null,
    prefix: null,
    sourcePath: null,
    stats: false
  });

  if (stats && data.stats === false) {
    data.stats = stats;
  }

  var isDir = data.type === 'directory';

  if (data.name) {
    if (typeof data.prefix === 'string' && '' !== data.prefix) {
      data.name = data.prefix + '/' + data.name;
      data.prefix = null;
    }

    data.name = util.sanitizePath(data.name);

    if (data.type !== 'symlink' && data.name.slice(-1) === '/') {
      isDir = true;
      data.type = 'directory';
    } else if (isDir) {
      data.name += '/';
    }
  }

  // 511 === 0777; 493 === 0755; 438 === 0666; 420 === 0644
  if (typeof data.mode === 'number') {
    if (win32) {
      data.mode &= 511;
    } else {
      data.mode &= 4095
    }
  } else if (data.stats && data.mode === null) {
    if (win32) {
      data.mode = data.stats.mode & 511;
    } else {
      data.mode = data.stats.mode & 4095;
    }

    // stat isn't reliable on windows; force 0755 for dir
    if (win32 && isDir) {
      data.mode = 493;
    }
  } else if (data.mode === null) {
    data.mode = isDir ? 493 : 420;
  }

  if (data.stats && data.date === null) {
    data.date = data.stats.mtime;
  } else {
    data.date = util.dateify(data.date);
  }

  return data;
};

/**
 * Error listener that re-emits error on to our internal stream.
 *
 * @private
 * @param  {Error} err
 * @return void
 */
Archiver.prototype._onModuleError = function(err) {
  /**
   * @event Archiver#error
   * @type {ErrorData}
   */
  this.emit('error', err);
};

/**
 * Checks the various state variables after queue has drained to determine if
 * we need to `finalize`.
 *
 * @private
 * @return void
 */
Archiver.prototype._onQueueDrain = function() {
  if (this._state.finalizing || this._state.finalized || this._state.aborted) {
    return;
  }

  if (this._state.finalize && this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
    this._finalize();
  }
};

/**
 * Appends each queue task to the module.
 *
 * @private
 * @param  {Object} task
 * @param  {Function} callback
 * @return void
 */
Archiver.prototype._onQueueTask = function(task, callback) {
  var fullCallback = () => {
    if(task.data.callback) {
      task.data.callback();
    }
    callback();
  }

  if (this._state.finalizing || this._state.finalized || this._state.aborted) {
    fullCallback();
    return;
  }

  this._task = task;
  this._moduleAppend(task.source, task.data, fullCallback);
};

/**
 * Performs a file stat and reinjects the task back into the queue.
 *
 * @private
 * @param  {Object} task
 * @param  {Function} callback
 * @return void
 */
Archiver.prototype._onStatQueueTask = function(task, callback) {
  if (this._state.finalizing || this._state.finalized || this._state.aborted) {
    callback();
    return;
  }

  fs.lstat(task.filepath, function(err, stats) {
    if (this._state.aborted) {
      setImmediate(callback);
      return;
    }

    if (err) {
      this._entriesCount--;

      /**
       * @event Archiver#warning
       * @type {ErrorData}
       */
      this.emit('warning', err);
      setImmediate(callback);
      return;
    }

    task = this._updateQueueTaskWithStats(task, stats);

    if (task) {
      if (stats.size) {
        this._fsEntriesTotalBytes += stats.size;
      }

      this._queue.push(task);
    }

    setImmediate(callback);
  }.bind(this));
};

/**
 * Unpipes the module and ends our internal stream.
 *
 * @private
 * @return void
 */
Archiver.prototype._shutdown = function() {
  this._moduleUnpipe();
  this.end();
};

/**
 * Tracks the bytes emitted by our internal stream.
 *
 * @private
 * @param  {Buffer} chunk
 * @param  {String} encoding
 * @param  {Function} callback
 * @return void
 */
Archiver.prototype._transform = function(chunk, encoding, callback) {
  if (chunk) {
    this._pointer += chunk.length;
  }

  callback(null, chunk);
};

/**
 * Updates and normalizes a queue task using stats data.
 *
 * @private
 * @param  {Object} task
 * @param  {fs.Stats} stats
 * @return {Object}
 */
Archiver.prototype._updateQueueTaskWithStats = function(task, stats) {
  if (stats.isFile()) {
    task.data.type = 'file';
    task.data.sourceType = 'stream';
    task.source = util.lazyReadStream(task.filepath);
  } else if (stats.isDirectory() && this._moduleSupports('directory')) {
    task.data.name = util.trailingSlashIt(task.data.name);
    task.data.type = 'directory';
    task.data.sourcePath = util.trailingSlashIt(task.filepath);
    task.data.sourceType = 'buffer';
    task.source = Buffer.concat([]);
  } else if (stats.isSymbolicLink() && this._moduleSupports('symlink')) {
    var linkPath = fs.readlinkSync(task.filepath);
    var dirName = path.dirname(task.filepath);
    task.data.type = 'symlink';
    task.data.linkname = path.relative(dirName, path.resolve(dirName, linkPath));
    task.data.sourceType = 'buffer';
    task.source = Buffer.concat([]);
  } else {
    if (stats.isDirectory()) {
      this.emit('warning', new ArchiverError('DIRECTORYNOTSUPPORTED', task.data));
    } else if (stats.isSymbolicLink()) {
      this.emit('warning', new ArchiverError('SYMLINKNOTSUPPORTED', task.data));
    } else {
      this.emit('warning', new ArchiverError('ENTRYNOTSUPPORTED', task.data));
    }

    return null;
  }

  task.data = this._normalizeEntryData(task.data, stats);

  return task;
};

/**
 * Aborts the archiving process, taking a best-effort approach, by:
 *
 * - removing any pending queue tasks
 * - allowing any active queue workers to finish
 * - detaching internal module pipes
 * - ending both sides of the Transform stream
 *
 * It will NOT drain any remaining sources.
 *
 * @return {this}
 */
Archiver.prototype.abort = function() {
  if (this._state.aborted || this._state.finalized) {
    return this;
  }

  this._abort();

  return this;
};

/**
 * Appends an input source (text string, buffer, or stream) to the instance.
 *
 * When the instance has received, processed, and emitted the input, the `entry`
 * event is fired.
 *
 * @fires  Archiver#entry
 * @param  {(Buffer|Stream|String)} source The input source.
 * @param  {EntryData} data See also {@link ZipEntryData} and {@link TarEntryData}.
 * @return {this}
 */
Archiver.prototype.append = function(source, data) {
  if (this._state.finalize || this._state.aborted) {
    this.emit('error', new ArchiverError('QUEUECLOSED'));
    return this;
  }

  data = this._normalizeEntryData(data);

  if (typeof data.name !== 'string' || data.name.length === 0) {
    this.emit('error', new ArchiverError('ENTRYNAMEREQUIRED'));
    return this;
  }

  if (data.type === 'directory' && !this._moduleSupports('directory')) {
    this.emit('error', new ArchiverError('DIRECTORYNOTSUPPORTED', { name: data.name }));
    return this;
  }

  source = util.normalizeInputSource(source);

  if (Buffer.isBuffer(source)) {
    data.sourceType = 'buffer';
  } else if (util.isStream(source)) {
    data.sourceType = 'stream';
  } else {
    this.emit('error', new ArchiverError('INPUTSTEAMBUFFERREQUIRED', { name: data.name }));
    return this;
  }

  this._entriesCount++;
  this._queue.push({
    data: data,
    source: source
  });

  return this;
};

/**
 * Appends a directory and its files, recursively, given its dirpath.
 *
 * @param  {String} dirpath The source directory path.
 * @param  {String} destpath The destination path within the archive.
 * @param  {(EntryData|Function)} data See also [ZipEntryData]{@link ZipEntryData} and
 * [TarEntryData]{@link TarEntryData}.
 * @return {this}
 */
Archiver.prototype.directory = function(dirpath, destpath, data) {
  if (this._state.finalize || this._state.aborted) {
    this.emit('error', new ArchiverError('QUEUECLOSED'));
    return this;
  }

  if (typeof dirpath !== 'string' || dirpath.length === 0) {
    this.emit('error', new ArchiverError('DIRECTORYDIRPATHREQUIRED'));
    return this;
  }

  this._pending++;

  if (destpath === false) {
    destpath = '';
  } else if (typeof destpath !== 'string'){
    destpath = dirpath;
  }

  var dataFunction = false;
  if (typeof data === 'function') {
    dataFunction = data;
    data = {};
  } else if (typeof data !== 'object') {
    data = {};
  }

  var globOptions = {
    stat: true,
    dot: true
  };

  function onGlobEnd() {
    this._pending--;
    this._maybeFinalize();
  }

  function onGlobError(err) {
    this.emit('error', err);
  }

  function onGlobMatch(match){
    globber.pause();

    var ignoreMatch = false;
    var entryData = Object.assign({}, data);
    entryData.name = match.relative;
    entryData.prefix = destpath;
    entryData.stats = match.stat;
    entryData.callback = globber.resume.bind(globber);

    try {
      if (dataFunction) {
        entryData = dataFunction(entryData);

        if (entryData === false) {
          ignoreMatch = true;
        } else if (typeof entryData !== 'object') {
          throw new ArchiverError('DIRECTORYFUNCTIONINVALIDDATA', { dirpath: dirpath });
        }
      }
    } catch(e) {
      this.emit('error', e);
      return;
    }

    if (ignoreMatch) {
      globber.resume();
      return;
    }

    this._append(match.absolute, entryData);
  }

  var globber = glob(dirpath, globOptions);
  globber.on('error', onGlobError.bind(this));
  globber.on('match', onGlobMatch.bind(this));
  globber.on('end', onGlobEnd.bind(this));

  return this;
};

/**
 * Appends a file given its filepath using a
 * [lazystream]{@link https://github.com/jpommerening/node-lazystream} wrapper to
 * prevent issues with open file limits.
 *
 * When the instance has received, processed, and emitted the file, the `entry`
 * event is fired.
 *
 * @param  {String} filepath The source filepath.
 * @param  {EntryData} data See also [ZipEntryData]{@link ZipEntryData} and
 * [TarEntryData]{@link TarEntryData}.
 * @return {this}
 */
Archiver.prototype.file = function(filepath, data) {
  if (this._state.finalize || this._state.aborted) {
    this.emit('error', new ArchiverError('QUEUECLOSED'));
    return this;
  }

  if (typeof filepath !== 'string' || filepath.length === 0) {
    this.emit('error', new ArchiverError('FILEFILEPATHREQUIRED'));
    return this;
  }

  this._append(filepath, data);

  return this;
};

/**
 * Appends multiple files that match a glob pattern.
 *
 * @param  {String} pattern The [glob pattern]{@link https://github.com/isaacs/minimatch} to match.
 * @param  {Object} options See [node-readdir-glob]{@link https://github.com/yqnn/node-readdir-glob#options}.
 * @param  {EntryData} data See also [ZipEntryData]{@link ZipEntryData} and
 * [TarEntryData]{@link TarEntryData}.
 * @return {this}
 */
Archiver.prototype.glob = function(pattern, options, data) {
  this._pending++;

  options = util.defaults(options, {
    stat: true,
    pattern: pattern
  });

  function onGlobEnd() {
    this._pending--;
    this._maybeFinalize();
  }

  function onGlobError(err) {
    this.emit('error', err);
  }

  function onGlobMatch(match){
    globber.pause();
    var entryData = Object.assign({}, data);
    entryData.callback = globber.resume.bind(globber);
    entryData.stats = match.stat;
    entryData.name = match.relative;

    this._append(match.absolute, entryData);
  }

  var globber = glob(options.cwd || '.', options);
  globber.on('error', onGlobError.bind(this));
  globber.on('match', onGlobMatch.bind(this));
  globber.on('end', onGlobEnd.bind(this));

  return this;
};

/**
 * Finalizes the instance and prevents further appending to the archive
 * structure (queue will continue til drained).
 *
 * The `end`, `close` or `finish` events on the destination stream may fire
 * right after calling this method so you should set listeners beforehand to
 * properly detect stream completion.
 *
 * @return {Promise}
 */
Archiver.prototype.finalize = function() {
  if (this._state.aborted) {
    var abortedError = new ArchiverError('ABORTED');
    this.emit('error', abortedError);
    return Promise.reject(abortedError);
  }

  if (this._state.finalize) {
    var finalizingError = new ArchiverError('FINALIZING');
    this.emit('error', finalizingError);
    return Promise.reject(finalizingError);
  }

  this._state.finalize = true;

  if (this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
    this._finalize();
  }

  var self = this;

  return new Promise(function(resolve, reject) {
    var errored;

    self._module.on('end', function() {
      if (!errored) {
        resolve();
      }
    })

    self._module.on('error', function(err) {
      errored = true;
      reject(err);
    })
  })
};

/**
 * Sets the module format name used for archiving.
 *
 * @param {String} format The name of the format.
 * @return {this}
 */
Archiver.prototype.setFormat = function(format) {
  if (this._format) {
    this.emit('error', new ArchiverError('FORMATSET'));
    return this;
  }

  this._format = format;

  return this;
};

/**
 * Sets the module used for archiving.
 *
 * @param {Function} module The function for archiver to interact with.
 * @return {this}
 */
Archiver.prototype.setModule = function(module) {
  if (this._state.aborted) {
    this.emit('error', new ArchiverError('ABORTED'));
    return this;
  }

  if (this._state.module) {
    this.emit('error', new ArchiverError('MODULESET'));
    return this;
  }

  this._module = module;
  this._modulePipe();

  return this;
};

/**
 * Appends a symlink to the instance.
 *
 * This does NOT interact with filesystem and is used for programmatically creating symlinks.
 *
 * @param  {String} filepath The symlink path (within archive).
 * @param  {String} target The target path (within archive).
 * @param  {Number} mode Sets the entry permissions.
 * @return {this}
 */
Archiver.prototype.symlink = function(filepath, target, mode) {
  if (this._state.finalize || this._state.aborted) {
    this.emit('error', new ArchiverError('QUEUECLOSED'));
    return this;
  }

  if (typeof filepath !== 'string' || filepath.length === 0) {
    this.emit('error', new ArchiverError('SYMLINKFILEPATHREQUIRED'));
    return this;
  }

  if (typeof target !== 'string' || target.length === 0) {
    this.emit('error', new ArchiverError('SYMLINKTARGETREQUIRED', { filepath: filepath }));
    return this;
  }

  if (!this._moduleSupports('symlink')) {
    this.emit('error', new ArchiverError('SYMLINKNOTSUPPORTED', { filepath: filepath }));
    return this;
  }

  var data = {};
  data.type = 'symlink';
  data.name = filepath.replace(/\\/g, '/');
  data.linkname = target.replace(/\\/g, '/');
  data.sourceType = 'buffer';

  if (typeof mode === "number") {
    data.mode = mode;
  }

  this._entriesCount++;
  this._queue.push({
    data: data,
    source: Buffer.concat([])
  });

  return this;
};

/**
 * Returns the current length (in bytes) that has been emitted.
 *
 * @return {Number}
 */
Archiver.prototype.pointer = function() {
  return this._pointer;
};

/**
 * Middleware-like helper that has yet to be fully implemented.
 *
 * @private
 * @param  {Function} plugin
 * @return {this}
 */
Archiver.prototype.use = function(plugin) {
  this._streams.push(plugin);
  return this;
};

module.exports = Archiver;

/**
 * @typedef {Object} CoreOptions
 * @global
 * @property {Number} [statConcurrency=4] Sets the number of workers used to
 * process the internal fs stat queue.
 */

/**
 * @typedef {Object} TransformOptions
 * @property {Boolean} [allowHalfOpen=true] If set to false, then the stream
 * will automatically end the readable side when the writable side ends and vice
 * versa.
 * @property {Boolean} [readableObjectMode=false] Sets objectMode for readable
 * side of the stream. Has no effect if objectMode is true.
 * @property {Boolean} [writableObjectMode=false] Sets objectMode for writable
 * side of the stream. Has no effect if objectMode is true.
 * @property {Boolean} [decodeStrings=true] Whether or not to decode strings
 * into Buffers before passing them to _write(). `Writable`
 * @property {String} [encoding=NULL] If specified, then buffers will be decoded
 * to strings using the specified encoding. `Readable`
 * @property {Number} [highWaterMark=16kb] The maximum number of bytes to store
 * in the internal buffer before ceasing to read from the underlying resource.
 * `Readable` `Writable`
 * @property {Boolean} [objectMode=false] Whether this stream should behave as a
 * stream of objects. Meaning that stream.read(n) returns a single value instead
 * of a Buffer of size n. `Readable` `Writable`
 */

/**
 * @typedef {Object} EntryData
 * @property {String} name Sets the entry name including internal path.
 * @property {(String|Date)} [date=NOW()] Sets the entry date.
 * @property {Number} [mode=D:0755/F:0644] Sets the entry permissions.
 * @property {String} [prefix] Sets a path prefix for the entry name. Useful
 * when working with methods like `directory` or `glob`.
 * @property {fs.Stats} [stats] Sets the fs stat data for this entry allowing
 * for reduction of fs stat calls when stat data is already known.
 */

/**
 * @typedef {Object} ErrorData
 * @property {String} message The message of the error.
 * @property {String} code The error code assigned to this error.
 * @property {String} data Additional data provided for reporting or debugging (where available).
 */

/**
 * @typedef {Object} ProgressData
 * @property {Object} entries
 * @property {Number} entries.total Number of entries that have been appended.
 * @property {Number} entries.processed Number of entries that have been processed.
 * @property {Object} fs
 * @property {Number} fs.totalBytes Number of bytes that have been appended. Calculated asynchronously and might not be accurate: it growth while entries are added. (based on fs.Stats)
 * @property {Number} fs.processedBytes Number of bytes that have been processed. (based on fs.Stats)
 */


/***/ }),

/***/ 3143:
/***/ ((module, exports, __nccwpck_require__) => {

/**
 * Archiver Core
 *
 * @ignore
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */

var util = __nccwpck_require__(3837);

const ERROR_CODES = {
  'ABORTED': 'archive was aborted',
  'DIRECTORYDIRPATHREQUIRED': 'diretory dirpath argument must be a non-empty string value',
  'DIRECTORYFUNCTIONINVALIDDATA': 'invalid data returned by directory custom data function',
  'ENTRYNAMEREQUIRED': 'entry name must be a non-empty string value',
  'FILEFILEPATHREQUIRED': 'file filepath argument must be a non-empty string value',
  'FINALIZING': 'archive already finalizing',
  'QUEUECLOSED': 'queue closed',
  'NOENDMETHOD': 'no suitable finalize/end method defined by module',
  'DIRECTORYNOTSUPPORTED': 'support for directory entries not defined by module',
  'FORMATSET': 'archive format already set',
  'INPUTSTEAMBUFFERREQUIRED': 'input source must be valid Stream or Buffer instance',
  'MODULESET': 'module already set',
  'SYMLINKNOTSUPPORTED': 'support for symlink entries not defined by module',
  'SYMLINKFILEPATHREQUIRED': 'symlink filepath argument must be a non-empty string value',
  'SYMLINKTARGETREQUIRED': 'symlink target argument must be a non-empty string value',
  'ENTRYNOTSUPPORTED': 'entry not supported'
};

function ArchiverError(code, data) {
  Error.captureStackTrace(this, this.constructor);
  //this.name = this.constructor.name;
  this.message = ERROR_CODES[code] || code;
  this.code = code;
  this.data = data;
}

util.inherits(ArchiverError, Error);

exports = module.exports = ArchiverError;

/***/ }),

/***/ 9827:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * JSON Format Plugin
 *
 * @module plugins/json
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
var inherits = (__nccwpck_require__(3837).inherits);
var Transform = (__nccwpck_require__(1642).Transform);

var crc32 = __nccwpck_require__(4794);
var util = __nccwpck_require__(2072);

/**
 * @constructor
 * @param {(JsonOptions|TransformOptions)} options
 */
var Json = function(options) {
  if (!(this instanceof Json)) {
    return new Json(options);
  }

  options = this.options = util.defaults(options, {});

  Transform.call(this, options);

  this.supports = {
    directory: true,
    symlink: true
  };

  this.files = [];
};

inherits(Json, Transform);

/**
 * [_transform description]
 *
 * @private
 * @param  {Buffer}   chunk
 * @param  {String}   encoding
 * @param  {Function} callback
 * @return void
 */
Json.prototype._transform = function(chunk, encoding, callback) {
  callback(null, chunk);
};

/**
 * [_writeStringified description]
 *
 * @private
 * @return void
 */
Json.prototype._writeStringified = function() {
  var fileString = JSON.stringify(this.files);
  this.write(fileString);
};

/**
 * [append description]
 *
 * @param  {(Buffer|Stream)}   source
 * @param  {EntryData}   data
 * @param  {Function} callback
 * @return void
 */
Json.prototype.append = function(source, data, callback) {
  var self = this;

  data.crc32 = 0;

  function onend(err, sourceBuffer) {
    if (err) {
      callback(err);
      return;
    }

    data.size = sourceBuffer.length || 0;
    data.crc32 = crc32.unsigned(sourceBuffer);

    self.files.push(data);

    callback(null, data);
  }

  if (data.sourceType === 'buffer') {
    onend(null, source);
  } else if (data.sourceType === 'stream') {
    util.collectStream(source, onend);
  }
};

/**
 * [finalize description]
 *
 * @return void
 */
Json.prototype.finalize = function() {
  this._writeStringified();
  this.end();
};

module.exports = Json;

/**
 * @typedef {Object} JsonOptions
 * @global
 */


/***/ }),

/***/ 3614:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * TAR Format Plugin
 *
 * @module plugins/tar
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
var zlib = __nccwpck_require__(9796);

var engine = __nccwpck_require__(2283);
var util = __nccwpck_require__(2072);

/**
 * @constructor
 * @param {TarOptions} options
 */
var Tar = function(options) {
  if (!(this instanceof Tar)) {
    return new Tar(options);
  }

  options = this.options = util.defaults(options, {
    gzip: false
  });

  if (typeof options.gzipOptions !== 'object') {
    options.gzipOptions = {};
  }

  this.supports = {
    directory: true,
    symlink: true
  };

  this.engine = engine.pack(options);
  this.compressor = false;

  if (options.gzip) {
    this.compressor = zlib.createGzip(options.gzipOptions);
    this.compressor.on('error', this._onCompressorError.bind(this));
  }
};

/**
 * [_onCompressorError description]
 *
 * @private
 * @param  {Error} err
 * @return void
 */
Tar.prototype._onCompressorError = function(err) {
  this.engine.emit('error', err);
};

/**
 * [append description]
 *
 * @param  {(Buffer|Stream)} source
 * @param  {TarEntryData} data
 * @param  {Function} callback
 * @return void
 */
Tar.prototype.append = function(source, data, callback) {
  var self = this;

  data.mtime = data.date;

  function append(err, sourceBuffer) {
    if (err) {
      callback(err);
      return;
    }

    self.engine.entry(data, sourceBuffer, function(err) {
      callback(err, data);
    });
  }

  if (data.sourceType === 'buffer') {
    append(null, source);
  } else if (data.sourceType === 'stream' && data.stats) {
    data.size = data.stats.size;

    var entry = self.engine.entry(data, function(err) {
      callback(err, data);
    });

    source.pipe(entry);
  } else if (data.sourceType === 'stream') {
    util.collectStream(source, append);
  }
};

/**
 * [finalize description]
 *
 * @return void
 */
Tar.prototype.finalize = function() {
  this.engine.finalize();
};

/**
 * [on description]
 *
 * @return this.engine
 */
Tar.prototype.on = function() {
  return this.engine.on.apply(this.engine, arguments);
};

/**
 * [pipe description]
 *
 * @param  {String} destination
 * @param  {Object} options
 * @return this.engine
 */
Tar.prototype.pipe = function(destination, options) {
  if (this.compressor) {
    return this.engine.pipe.apply(this.engine, [this.compressor]).pipe(destination, options);
  } else {
    return this.engine.pipe.apply(this.engine, arguments);
  }
};

/**
 * [unpipe description]
 *
 * @return this.engine
 */
Tar.prototype.unpipe = function() {
  if (this.compressor) {
    return this.compressor.unpipe.apply(this.compressor, arguments);
  } else {
    return this.engine.unpipe.apply(this.engine, arguments);
  }
};

module.exports = Tar;

/**
 * @typedef {Object} TarOptions
 * @global
 * @property {Boolean} [gzip=false] Compress the tar archive using gzip.
 * @property {Object} [gzipOptions] Passed to [zlib]{@link https://nodejs.org/api/zlib.html#zlib_class_options}
 * to control compression.
 * @property {*} [*] See [tar-stream]{@link https://github.com/mafintosh/tar-stream} documentation for additional properties.
 */

/**
 * @typedef {Object} TarEntryData
 * @global
 * @property {String} name Sets the entry name including internal path.
 * @property {(String|Date)} [date=NOW()] Sets the entry date.
 * @property {Number} [mode=D:0755/F:0644] Sets the entry permissions.
 * @property {String} [prefix] Sets a path prefix for the entry name. Useful
 * when working with methods like `directory` or `glob`.
 * @property {fs.Stats} [stats] Sets the fs stat data for this entry allowing
 * for reduction of fs stat calls when stat data is already known.
 */

/**
 * TarStream Module
 * @external TarStream
 * @see {@link https://github.com/mafintosh/tar-stream}
 */


/***/ }),

/***/ 8987:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * ZIP Format Plugin
 *
 * @module plugins/zip
 * @license [MIT]{@link https://github.com/archiverjs/node-archiver/blob/master/LICENSE}
 * @copyright (c) 2012-2014 Chris Talkington, contributors.
 */
var engine = __nccwpck_require__(6454);
var util = __nccwpck_require__(2072);

/**
 * @constructor
 * @param {ZipOptions} [options]
 * @param {String} [options.comment] Sets the zip archive comment.
 * @param {Boolean} [options.forceLocalTime=false] Forces the archive to contain local file times instead of UTC.
 * @param {Boolean} [options.forceZip64=false] Forces the archive to contain ZIP64 headers.
 * @param {Boolean} [options.namePrependSlash=false] Prepends a forward slash to archive file paths.
 * @param {Boolean} [options.store=false] Sets the compression method to STORE.
 * @param {Object} [options.zlib] Passed to [zlib]{@link https://nodejs.org/api/zlib.html#zlib_class_options}
 */
var Zip = function(options) {
  if (!(this instanceof Zip)) {
    return new Zip(options);
  }

  options = this.options = util.defaults(options, {
    comment: '',
    forceUTC: false,
    namePrependSlash: false,
    store: false
  });

  this.supports = {
    directory: true,
    symlink: true
  };

  this.engine = new engine(options);
};

/**
 * @param  {(Buffer|Stream)} source
 * @param  {ZipEntryData} data
 * @param  {String} data.name Sets the entry name including internal path.
 * @param  {(String|Date)} [data.date=NOW()] Sets the entry date.
 * @param  {Number} [data.mode=D:0755/F:0644] Sets the entry permissions.
 * @param  {String} [data.prefix] Sets a path prefix for the entry name. Useful
 * when working with methods like `directory` or `glob`.
 * @param  {fs.Stats} [data.stats] Sets the fs stat data for this entry allowing
 * for reduction of fs stat calls when stat data is already known.
 * @param  {Boolean} [data.store=ZipOptions.store] Sets the compression method to STORE.
 * @param  {Function} callback
 * @return void
 */
Zip.prototype.append = function(source, data, callback) {
  this.engine.entry(source, data, callback);
};

/**
 * @return void
 */
Zip.prototype.finalize = function() {
  this.engine.finalize();
};

/**
 * @return this.engine
 */
Zip.prototype.on = function() {
  return this.engine.on.apply(this.engine, arguments);
};

/**
 * @return this.engine
 */
Zip.prototype.pipe = function() {
  return this.engine.pipe.apply(this.engine, arguments);
};

/**
 * @return this.engine
 */
Zip.prototype.unpipe = function() {
  return this.engine.unpipe.apply(this.engine, arguments);
};

module.exports = Zip;

/**
 * @typedef {Object} ZipOptions
 * @global
 * @property {String} [comment] Sets the zip archive comment.
 * @property {Boolean} [forceLocalTime=false] Forces the archive to contain local file times instead of UTC.
 * @property {Boolean} [forceZip64=false] Forces the archive to contain ZIP64 headers.
 * @prpperty {Boolean} [namePrependSlash=false] Prepends a forward slash to archive file paths.
 * @property {Boolean} [store=false] Sets the compression method to STORE.
 * @property {Object} [zlib] Passed to [zlib]{@link https://nodejs.org/api/zlib.html#zlib_class_options}
 * to control compression.
 * @property {*} [*] See [zip-stream]{@link https://archiverjs.com/zip-stream/ZipStream.html} documentation for current list of properties.
 */

/**
 * @typedef {Object} ZipEntryData
 * @global
 * @property {String} name Sets the entry name including internal path.
 * @property {(String|Date)} [date=NOW()] Sets the entry date.
 * @property {Number} [mode=D:0755/F:0644] Sets the entry permissions.
 * @property {Boolean} [namePrependSlash=ZipOptions.namePrependSlash] Prepends a forward slash to archive file paths.
 * @property {String} [prefix] Sets a path prefix for the entry name. Useful
 * when working with methods like `directory` or `glob`.
 * @property {fs.Stats} [stats] Sets the fs stat data for this entry allowing
 * for reduction of fs stat calls when stat data is already known.
 * @property {Boolean} [store=ZipOptions.store] Sets the compression method to STORE.
 */

/**
 * ZipStream Module
 * @external ZipStream
 * @see {@link https://www.archiverjs.com/zip-stream/ZipStream.html}
 */


/***/ }),

/***/ 7888:
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    /**
     * Creates a continuation function with some arguments already applied.
     *
     * Useful as a shorthand when combined with other control flow functions. Any
     * arguments passed to the returned function are added to the arguments
     * originally passed to apply.
     *
     * @name apply
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {Function} fn - The function you want to eventually apply all
     * arguments to. Invokes with (arguments...).
     * @param {...*} arguments... - Any number of arguments to automatically apply
     * when the continuation is called.
     * @returns {Function} the partially-applied function
     * @example
     *
     * // using apply
     * async.parallel([
     *     async.apply(fs.writeFile, 'testfile1', 'test1'),
     *     async.apply(fs.writeFile, 'testfile2', 'test2')
     * ]);
     *
     *
     * // the same process without using apply
     * async.parallel([
     *     function(callback) {
     *         fs.writeFile('testfile1', 'test1', callback);
     *     },
     *     function(callback) {
     *         fs.writeFile('testfile2', 'test2', callback);
     *     }
     * ]);
     *
     * // It's possible to pass any number of additional arguments when calling the
     * // continuation:
     *
     * node> var fn = async.apply(sys.puts, 'one');
     * node> fn('two', 'three');
     * one
     * two
     * three
     */
    function apply(fn, ...args) {
        return (...callArgs) => fn(...args,...callArgs);
    }

    function initialParams (fn) {
        return function (...args/*, callback*/) {
            var callback = args.pop();
            return fn.call(this, args, callback);
        };
    }

    /* istanbul ignore file */

    var hasQueueMicrotask = typeof queueMicrotask === 'function' && queueMicrotask;
    var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
    var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function fallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return (fn, ...args) => defer(() => fn(...args));
    }

    var _defer$1;

    if (hasQueueMicrotask) {
        _defer$1 = queueMicrotask;
    } else if (hasSetImmediate) {
        _defer$1 = setImmediate;
    } else if (hasNextTick) {
        _defer$1 = process.nextTick;
    } else {
        _defer$1 = fallback;
    }

    var setImmediate$1 = wrap(_defer$1);

    /**
     * Take a sync function and make it async, passing its return value to a
     * callback. This is useful for plugging sync functions into a waterfall,
     * series, or other async functions. Any arguments passed to the generated
     * function will be passed to the wrapped function (except for the final
     * callback argument). Errors thrown will be passed to the callback.
     *
     * If the function passed to `asyncify` returns a Promise, that promises's
     * resolved/rejected state will be used to call the callback, rather than simply
     * the synchronous return value.
     *
     * This also means you can asyncify ES2017 `async` functions.
     *
     * @name asyncify
     * @static
     * @memberOf module:Utils
     * @method
     * @alias wrapSync
     * @category Util
     * @param {Function} func - The synchronous function, or Promise-returning
     * function to convert to an {@link AsyncFunction}.
     * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
     * invoked with `(args..., callback)`.
     * @example
     *
     * // passing a regular synchronous function
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(JSON.parse),
     *     function (data, next) {
     *         // data is the result of parsing the text.
     *         // If there was a parsing error, it would have been caught.
     *     }
     * ], callback);
     *
     * // passing a function returning a promise
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(function (contents) {
     *         return db.model.create(contents);
     *     }),
     *     function (model, next) {
     *         // `model` is the instantiated model object.
     *         // If there was an error, this function would be skipped.
     *     }
     * ], callback);
     *
     * // es2017 example, though `asyncify` is not needed if your JS environment
     * // supports async functions out of the box
     * var q = async.queue(async.asyncify(async function(file) {
     *     var intermediateStep = await processFile(file);
     *     return await somePromise(intermediateStep)
     * }));
     *
     * q.push(files);
     */
    function asyncify(func) {
        if (isAsync(func)) {
            return function (...args/*, callback*/) {
                const callback = args.pop();
                const promise = func.apply(this, args);
                return handlePromise(promise, callback)
            }
        }

        return initialParams(function (args, callback) {
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (result && typeof result.then === 'function') {
                return handlePromise(result, callback)
            } else {
                callback(null, result);
            }
        });
    }

    function handlePromise(promise, callback) {
        return promise.then(value => {
            invokeCallback(callback, null, value);
        }, err => {
            invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
        });
    }

    function invokeCallback(callback, error, value) {
        try {
            callback(error, value);
        } catch (err) {
            setImmediate$1(e => { throw e }, err);
        }
    }

    function isAsync(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function isAsyncGenerator(fn) {
        return fn[Symbol.toStringTag] === 'AsyncGenerator';
    }

    function isAsyncIterable(obj) {
        return typeof obj[Symbol.asyncIterator] === 'function';
    }

    function wrapAsync(asyncFn) {
        if (typeof asyncFn !== 'function') throw new Error('expected a function')
        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    }

    // conditionally promisify a function.
    // only return a promise if a callback is omitted
    function awaitify (asyncFn, arity) {
        if (!arity) arity = asyncFn.length;
        if (!arity) throw new Error('arity is undefined')
        function awaitable (...args) {
            if (typeof args[arity - 1] === 'function') {
                return asyncFn.apply(this, args)
            }

            return new Promise((resolve, reject) => {
                args[arity - 1] = (err, ...cbArgs) => {
                    if (err) return reject(err)
                    resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
                };
                asyncFn.apply(this, args);
            })
        }

        return awaitable
    }

    function applyEach$1 (eachfn) {
        return function applyEach(fns, ...callArgs) {
            const go = awaitify(function (callback) {
                var that = this;
                return eachfn(fns, (fn, cb) => {
                    wrapAsync(fn).apply(that, callArgs.concat(cb));
                }, callback);
            });
            return go;
        };
    }

    function _asyncMap(eachfn, arr, iteratee, callback) {
        arr = arr || [];
        var results = [];
        var counter = 0;
        var _iteratee = wrapAsync(iteratee);

        return eachfn(arr, (value, _, iterCb) => {
            var index = counter++;
            _iteratee(value, (err, v) => {
                results[index] = v;
                iterCb(err);
            });
        }, err => {
            callback(err, results);
        });
    }

    function isArrayLike(value) {
        return value &&
            typeof value.length === 'number' &&
            value.length >= 0 &&
            value.length % 1 === 0;
    }

    // A temporary value used to identify if the loop should be broken.
    // See #1064, #1293
    const breakLoop = {};
    var breakLoop$1 = breakLoop;

    function once(fn) {
        function wrapper (...args) {
            if (fn === null) return;
            var callFn = fn;
            fn = null;
            callFn.apply(this, args);
        }
        Object.assign(wrapper, fn);
        return wrapper
    }

    function getIterator (coll) {
        return coll[Symbol.iterator] && coll[Symbol.iterator]();
    }

    function createArrayIterator(coll) {
        var i = -1;
        var len = coll.length;
        return function next() {
            return ++i < len ? {value: coll[i], key: i} : null;
        }
    }

    function createES2015Iterator(iterator) {
        var i = -1;
        return function next() {
            var item = iterator.next();
            if (item.done)
                return null;
            i++;
            return {value: item.value, key: i};
        }
    }

    function createObjectIterator(obj) {
        var okeys = obj ? Object.keys(obj) : [];
        var i = -1;
        var len = okeys.length;
        return function next() {
            var key = okeys[++i];
            if (key === '__proto__') {
                return next();
            }
            return i < len ? {value: obj[key], key} : null;
        };
    }

    function createIterator(coll) {
        if (isArrayLike(coll)) {
            return createArrayIterator(coll);
        }

        var iterator = getIterator(coll);
        return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
    }

    function onlyOnce(fn) {
        return function (...args) {
            if (fn === null) throw new Error("Callback was already called.");
            var callFn = fn;
            fn = null;
            callFn.apply(this, args);
        };
    }

    // for async generators
    function asyncEachOfLimit(generator, limit, iteratee, callback) {
        let done = false;
        let canceled = false;
        let awaiting = false;
        let running = 0;
        let idx = 0;

        function replenish() {
            //console.log('replenish')
            if (running >= limit || awaiting || done) return
            //console.log('replenish awaiting')
            awaiting = true;
            generator.next().then(({value, done: iterDone}) => {
                //console.log('got value', value)
                if (canceled || done) return
                awaiting = false;
                if (iterDone) {
                    done = true;
                    if (running <= 0) {
                        //console.log('done nextCb')
                        callback(null);
                    }
                    return;
                }
                running++;
                iteratee(value, idx, iterateeCallback);
                idx++;
                replenish();
            }).catch(handleError);
        }

        function iterateeCallback(err, result) {
            //console.log('iterateeCallback')
            running -= 1;
            if (canceled) return
            if (err) return handleError(err)

            if (err === false) {
                done = true;
                canceled = true;
                return
            }

            if (result === breakLoop$1 || (done && running <= 0)) {
                done = true;
                //console.log('done iterCb')
                return callback(null);
            }
            replenish();
        }

        function handleError(err) {
            if (canceled) return
            awaiting = false;
            done = true;
            callback(err);
        }

        replenish();
    }

    var eachOfLimit$2 = (limit) => {
        return (obj, iteratee, callback) => {
            callback = once(callback);
            if (limit <= 0) {
                throw new RangeError('concurrency limit cannot be less than 1')
            }
            if (!obj) {
                return callback(null);
            }
            if (isAsyncGenerator(obj)) {
                return asyncEachOfLimit(obj, limit, iteratee, callback)
            }
            if (isAsyncIterable(obj)) {
                return asyncEachOfLimit(obj[Symbol.asyncIterator](), limit, iteratee, callback)
            }
            var nextElem = createIterator(obj);
            var done = false;
            var canceled = false;
            var running = 0;
            var looping = false;

            function iterateeCallback(err, value) {
                if (canceled) return
                running -= 1;
                if (err) {
                    done = true;
                    callback(err);
                }
                else if (err === false) {
                    done = true;
                    canceled = true;
                }
                else if (value === breakLoop$1 || (done && running <= 0)) {
                    done = true;
                    return callback(null);
                }
                else if (!looping) {
                    replenish();
                }
            }

            function replenish () {
                looping = true;
                while (running < limit && !done) {
                    var elem = nextElem();
                    if (elem === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
                }
                looping = false;
            }

            replenish();
        };
    };

    /**
     * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name eachOfLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.eachOf]{@link module:Collections.eachOf}
     * @alias forEachOfLimit
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async function to apply to each
     * item in `coll`. The `key` is the item's key, or index in the case of an
     * array.
     * Invoked with (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function eachOfLimit(coll, limit, iteratee, callback) {
        return eachOfLimit$2(limit)(coll, wrapAsync(iteratee), callback);
    }

    var eachOfLimit$1 = awaitify(eachOfLimit, 4);

    // eachOf implementation optimized for array-likes
    function eachOfArrayLike(coll, iteratee, callback) {
        callback = once(callback);
        var index = 0,
            completed = 0,
            {length} = coll,
            canceled = false;
        if (length === 0) {
            callback(null);
        }

        function iteratorCallback(err, value) {
            if (err === false) {
                canceled = true;
            }
            if (canceled === true) return
            if (err) {
                callback(err);
            } else if ((++completed === length) || value === breakLoop$1) {
                callback(null);
            }
        }

        for (; index < length; index++) {
            iteratee(coll[index], index, onlyOnce(iteratorCallback));
        }
    }

    // a generic version of eachOf which can handle array, object, and iterator cases.
    function eachOfGeneric (coll, iteratee, callback) {
        return eachOfLimit$1(coll, Infinity, iteratee, callback);
    }

    /**
     * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
     * to the iteratee.
     *
     * @name eachOf
     * @static
     * @memberOf module:Collections
     * @method
     * @alias forEachOf
     * @category Collection
     * @see [async.each]{@link module:Collections.each}
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A function to apply to each
     * item in `coll`.
     * The `key` is the item's key, or index in the case of an array.
     * Invoked with (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     * @example
     *
     * // dev.json is a file containing a valid json object config for dev environment
     * // dev.json is a file containing a valid json object config for test environment
     * // prod.json is a file containing a valid json object config for prod environment
     * // invalid.json is a file with a malformed json object
     *
     * let configs = {}; //global variable
     * let validConfigFileMap = {dev: 'dev.json', test: 'test.json', prod: 'prod.json'};
     * let invalidConfigFileMap = {dev: 'dev.json', test: 'test.json', invalid: 'invalid.json'};
     *
     * // asynchronous function that reads a json file and parses the contents as json object
     * function parseFile(file, key, callback) {
     *     fs.readFile(file, "utf8", function(err, data) {
     *         if (err) return calback(err);
     *         try {
     *             configs[key] = JSON.parse(data);
     *         } catch (e) {
     *             return callback(e);
     *         }
     *         callback();
     *     });
     * }
     *
     * // Using callbacks
     * async.forEachOf(validConfigFileMap, parseFile, function (err) {
     *     if (err) {
     *         console.error(err);
     *     } else {
     *         console.log(configs);
     *         // configs is now a map of JSON data, e.g.
     *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
     *     }
     * });
     *
     * //Error handing
     * async.forEachOf(invalidConfigFileMap, parseFile, function (err) {
     *     if (err) {
     *         console.error(err);
     *         // JSON parse error exception
     *     } else {
     *         console.log(configs);
     *     }
     * });
     *
     * // Using Promises
     * async.forEachOf(validConfigFileMap, parseFile)
     * .then( () => {
     *     console.log(configs);
     *     // configs is now a map of JSON data, e.g.
     *     // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
     * }).catch( err => {
     *     console.error(err);
     * });
     *
     * //Error handing
     * async.forEachOf(invalidConfigFileMap, parseFile)
     * .then( () => {
     *     console.log(configs);
     * }).catch( err => {
     *     console.error(err);
     *     // JSON parse error exception
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.forEachOf(validConfigFileMap, parseFile);
     *         console.log(configs);
     *         // configs is now a map of JSON data, e.g.
     *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * //Error handing
     * async () => {
     *     try {
     *         let result = await async.forEachOf(invalidConfigFileMap, parseFile);
     *         console.log(configs);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // JSON parse error exception
     *     }
     * }
     *
     */
    function eachOf(coll, iteratee, callback) {
        var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
        return eachOfImplementation(coll, wrapAsync(iteratee), callback);
    }

    var eachOf$1 = awaitify(eachOf, 3);

    /**
     * Produces a new collection of values by mapping each value in `coll` through
     * the `iteratee` function. The `iteratee` is called with an item from `coll`
     * and a callback for when it has finished processing. Each of these callbacks
     * takes 2 arguments: an `error`, and the transformed item from `coll`. If
     * `iteratee` passes an error to its callback, the main `callback` (for the
     * `map` function) is immediately called with the error.
     *
     * Note, that since this function applies the `iteratee` to each item in
     * parallel, there is no guarantee that the `iteratee` functions will complete
     * in order. However, the results array will be in the same order as the
     * original `coll`.
     *
     * If `map` is passed an Object, the results will be an Array.  The results
     * will roughly be in the order of the original Objects' keys (but this can
     * vary across JavaScript engines).
     *
     * @name map
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with the transformed item.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an Array of the
     * transformed items from the `coll`. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * // file1.txt is a file that is 1000 bytes in size
     * // file2.txt is a file that is 2000 bytes in size
     * // file3.txt is a file that is 3000 bytes in size
     * // file4.txt does not exist
     *
     * const fileList = ['file1.txt','file2.txt','file3.txt'];
     * const withMissingFileList = ['file1.txt','file2.txt','file4.txt'];
     *
     * // asynchronous function that returns the file size in bytes
     * function getFileSizeInBytes(file, callback) {
     *     fs.stat(file, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         callback(null, stat.size);
     *     });
     * }
     *
     * // Using callbacks
     * async.map(fileList, getFileSizeInBytes, function(err, results) {
     *     if (err) {
     *         console.log(err);
     *     } else {
     *         console.log(results);
     *         // results is now an array of the file size in bytes for each file, e.g.
     *         // [ 1000, 2000, 3000]
     *     }
     * });
     *
     * // Error Handling
     * async.map(withMissingFileList, getFileSizeInBytes, function(err, results) {
     *     if (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     } else {
     *         console.log(results);
     *     }
     * });
     *
     * // Using Promises
     * async.map(fileList, getFileSizeInBytes)
     * .then( results => {
     *     console.log(results);
     *     // results is now an array of the file size in bytes for each file, e.g.
     *     // [ 1000, 2000, 3000]
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Error Handling
     * async.map(withMissingFileList, getFileSizeInBytes)
     * .then( results => {
     *     console.log(results);
     * }).catch( err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let results = await async.map(fileList, getFileSizeInBytes);
     *         console.log(results);
     *         // results is now an array of the file size in bytes for each file, e.g.
     *         // [ 1000, 2000, 3000]
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // Error Handling
     * async () => {
     *     try {
     *         let results = await async.map(withMissingFileList, getFileSizeInBytes);
     *         console.log(results);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     }
     * }
     *
     */
    function map (coll, iteratee, callback) {
        return _asyncMap(eachOf$1, coll, iteratee, callback)
    }
    var map$1 = awaitify(map, 3);

    /**
     * Applies the provided arguments to each function in the array, calling
     * `callback` after all functions have completed. If you only provide the first
     * argument, `fns`, then it will return a function which lets you pass in the
     * arguments as if it were a single function call. If more arguments are
     * provided, `callback` is required while `args` is still optional. The results
     * for each of the applied async functions are passed to the final callback
     * as an array.
     *
     * @name applyEach
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s
     * to all call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {AsyncFunction} - Returns a function that takes no args other than
     * an optional callback, that is the result of applying the `args` to each
     * of the functions.
     * @example
     *
     * const appliedFn = async.applyEach([enableSearch, updateSchema], 'bucket')
     *
     * appliedFn((err, results) => {
     *     // results[0] is the results for `enableSearch`
     *     // results[1] is the results for `updateSchema`
     * });
     *
     * // partial application example:
     * async.each(
     *     buckets,
     *     async (bucket) => async.applyEach([enableSearch, updateSchema], bucket)(),
     *     callback
     * );
     */
    var applyEach = applyEach$1(map$1);

    /**
     * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
     *
     * @name eachOfSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.eachOf]{@link module:Collections.eachOf}
     * @alias forEachOfSeries
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * Invoked with (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function eachOfSeries(coll, iteratee, callback) {
        return eachOfLimit$1(coll, 1, iteratee, callback)
    }
    var eachOfSeries$1 = awaitify(eachOfSeries, 3);

    /**
     * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
     *
     * @name mapSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with the transformed item.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     */
    function mapSeries (coll, iteratee, callback) {
        return _asyncMap(eachOfSeries$1, coll, iteratee, callback)
    }
    var mapSeries$1 = awaitify(mapSeries, 3);

    /**
     * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
     *
     * @name applyEachSeries
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.applyEach]{@link module:ControlFlow.applyEach}
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s to all
     * call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {AsyncFunction} - A function, that when called, is the result of
     * appling the `args` to the list of functions.  It takes no args, other than
     * a callback.
     */
    var applyEachSeries = applyEach$1(mapSeries$1);

    const PROMISE_SYMBOL = Symbol('promiseCallback');

    function promiseCallback () {
        let resolve, reject;
        function callback (err, ...args) {
            if (err) return reject(err)
            resolve(args.length > 1 ? args : args[0]);
        }

        callback[PROMISE_SYMBOL] = new Promise((res, rej) => {
            resolve = res,
            reject = rej;
        });

        return callback
    }

    /**
     * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
     * their requirements. Each function can optionally depend on other functions
     * being completed first, and each function is run as soon as its requirements
     * are satisfied.
     *
     * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
     * will stop. Further tasks will not execute (so any other functions depending
     * on it will not run), and the main `callback` is immediately called with the
     * error.
     *
     * {@link AsyncFunction}s also receive an object containing the results of functions which
     * have completed so far as the first argument, if they have dependencies. If a
     * task function has no dependencies, it will only be passed a callback.
     *
     * @name auto
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Object} tasks - An object. Each of its properties is either a
     * function or an array of requirements, with the {@link AsyncFunction} itself the last item
     * in the array. The object's key of a property serves as the name of the task
     * defined by that property, i.e. can be used when specifying requirements for
     * other tasks. The function receives one or two arguments:
     * * a `results` object, containing the results of the previously executed
     *   functions, only passed if the task has any dependencies,
     * * a `callback(err, result)` function, which must be called when finished,
     *   passing an `error` (which can be `null`) and the result of the function's
     *   execution.
     * @param {number} [concurrency=Infinity] - An optional `integer` for
     * determining the maximum number of tasks that can be run in parallel. By
     * default, as many as possible.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback. Results are always returned; however, if an
     * error occurs, no further `tasks` will be performed, and the results object
     * will only contain partial results. Invoked with (err, results).
     * @returns {Promise} a promise, if a callback is not passed
     * @example
     *
     * //Using Callbacks
     * async.auto({
     *     get_data: function(callback) {
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: ['get_data', 'make_folder', function(results, callback) {
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(results, callback) {
     *         // once the file is written let's email a link to it...
     *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
     *     }]
     * }, function(err, results) {
     *     if (err) {
     *         console.log('err = ', err);
     *     }
     *     console.log('results = ', results);
     *     // results = {
     *     //     get_data: ['data', 'converted to array']
     *     //     make_folder; 'folder',
     *     //     write_file: 'filename'
     *     //     email_link: { file: 'filename', email: 'user@example.com' }
     *     // }
     * });
     *
     * //Using Promises
     * async.auto({
     *     get_data: function(callback) {
     *         console.log('in get_data');
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         console.log('in make_folder');
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: ['get_data', 'make_folder', function(results, callback) {
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(results, callback) {
     *         // once the file is written let's email a link to it...
     *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
     *     }]
     * }).then(results => {
     *     console.log('results = ', results);
     *     // results = {
     *     //     get_data: ['data', 'converted to array']
     *     //     make_folder; 'folder',
     *     //     write_file: 'filename'
     *     //     email_link: { file: 'filename', email: 'user@example.com' }
     *     // }
     * }).catch(err => {
     *     console.log('err = ', err);
     * });
     *
     * //Using async/await
     * async () => {
     *     try {
     *         let results = await async.auto({
     *             get_data: function(callback) {
     *                 // async code to get some data
     *                 callback(null, 'data', 'converted to array');
     *             },
     *             make_folder: function(callback) {
     *                 // async code to create a directory to store a file in
     *                 // this is run at the same time as getting the data
     *                 callback(null, 'folder');
     *             },
     *             write_file: ['get_data', 'make_folder', function(results, callback) {
     *                 // once there is some data and the directory exists,
     *                 // write the data to a file in the directory
     *                 callback(null, 'filename');
     *             }],
     *             email_link: ['write_file', function(results, callback) {
     *                 // once the file is written let's email a link to it...
     *                 callback(null, {'file':results.write_file, 'email':'user@example.com'});
     *             }]
     *         });
     *         console.log('results = ', results);
     *         // results = {
     *         //     get_data: ['data', 'converted to array']
     *         //     make_folder; 'folder',
     *         //     write_file: 'filename'
     *         //     email_link: { file: 'filename', email: 'user@example.com' }
     *         // }
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function auto(tasks, concurrency, callback) {
        if (typeof concurrency !== 'number') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = once(callback || promiseCallback());
        var numTasks = Object.keys(tasks).length;
        if (!numTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = numTasks;
        }

        var results = {};
        var runningTasks = 0;
        var canceled = false;
        var hasError = false;

        var listeners = Object.create(null);

        var readyTasks = [];

        // for cycle detection:
        var readyToCheck = []; // tasks that have been identified as reachable
        // without the possibility of returning to an ancestor task
        var uncheckedDependencies = {};

        Object.keys(tasks).forEach(key => {
            var task = tasks[key];
            if (!Array.isArray(task)) {
                // no dependencies
                enqueueTask(key, [task]);
                readyToCheck.push(key);
                return;
            }

            var dependencies = task.slice(0, task.length - 1);
            var remainingDependencies = dependencies.length;
            if (remainingDependencies === 0) {
                enqueueTask(key, task);
                readyToCheck.push(key);
                return;
            }
            uncheckedDependencies[key] = remainingDependencies;

            dependencies.forEach(dependencyName => {
                if (!tasks[dependencyName]) {
                    throw new Error('async.auto task `' + key +
                        '` has a non-existent dependency `' +
                        dependencyName + '` in ' +
                        dependencies.join(', '));
                }
                addListener(dependencyName, () => {
                    remainingDependencies--;
                    if (remainingDependencies === 0) {
                        enqueueTask(key, task);
                    }
                });
            });
        });

        checkForDeadlocks();
        processQueue();

        function enqueueTask(key, task) {
            readyTasks.push(() => runTask(key, task));
        }

        function processQueue() {
            if (canceled) return
            if (readyTasks.length === 0 && runningTasks === 0) {
                return callback(null, results);
            }
            while(readyTasks.length && runningTasks < concurrency) {
                var run = readyTasks.shift();
                run();
            }

        }

        function addListener(taskName, fn) {
            var taskListeners = listeners[taskName];
            if (!taskListeners) {
                taskListeners = listeners[taskName] = [];
            }

            taskListeners.push(fn);
        }

        function taskComplete(taskName) {
            var taskListeners = listeners[taskName] || [];
            taskListeners.forEach(fn => fn());
            processQueue();
        }


        function runTask(key, task) {
            if (hasError) return;

            var taskCallback = onlyOnce((err, ...result) => {
                runningTasks--;
                if (err === false) {
                    canceled = true;
                    return
                }
                if (result.length < 2) {
                    [result] = result;
                }
                if (err) {
                    var safeResults = {};
                    Object.keys(results).forEach(rkey => {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[key] = result;
                    hasError = true;
                    listeners = Object.create(null);
                    if (canceled) return
                    callback(err, safeResults);
                } else {
                    results[key] = result;
                    taskComplete(key);
                }
            });

            runningTasks++;
            var taskFn = wrapAsync(task[task.length - 1]);
            if (task.length > 1) {
                taskFn(results, taskCallback);
            } else {
                taskFn(taskCallback);
            }
        }

        function checkForDeadlocks() {
            // Kahn's algorithm
            // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
            // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
            var currentTask;
            var counter = 0;
            while (readyToCheck.length) {
                currentTask = readyToCheck.pop();
                counter++;
                getDependents(currentTask).forEach(dependent => {
                    if (--uncheckedDependencies[dependent] === 0) {
                        readyToCheck.push(dependent);
                    }
                });
            }

            if (counter !== numTasks) {
                throw new Error(
                    'async.auto cannot execute tasks due to a recursive dependency'
                );
            }
        }

        function getDependents(taskName) {
            var result = [];
            Object.keys(tasks).forEach(key => {
                const task = tasks[key];
                if (Array.isArray(task) && task.indexOf(taskName) >= 0) {
                    result.push(key);
                }
            });
            return result;
        }

        return callback[PROMISE_SYMBOL]
    }

    var FN_ARGS = /^(?:async\s+)?(?:function)?\s*\w*\s*\(\s*([^)]+)\s*\)(?:\s*{)/;
    var ARROW_FN_ARGS = /^(?:async\s+)?\(?\s*([^)=]+)\s*\)?(?:\s*=>)/;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /(=.+)?(\s*)$/;

    function stripComments(string) {
        let stripped = '';
        let index = 0;
        let endBlockComment = string.indexOf('*/');
        while (index < string.length) {
            if (string[index] === '/' && string[index+1] === '/') {
                // inline comment
                let endIndex = string.indexOf('\n', index);
                index = (endIndex === -1) ? string.length : endIndex;
            } else if ((endBlockComment !== -1) && (string[index] === '/') && (string[index+1] === '*')) {
                // block comment
                let endIndex = string.indexOf('*/', index);
                if (endIndex !== -1) {
                    index = endIndex + 2;
                    endBlockComment = string.indexOf('*/', index);
                } else {
                    stripped += string[index];
                    index++;
                }
            } else {
                stripped += string[index];
                index++;
            }
        }
        return stripped;
    }

    function parseParams(func) {
        const src = stripComments(func.toString());
        let match = src.match(FN_ARGS);
        if (!match) {
            match = src.match(ARROW_FN_ARGS);
        }
        if (!match) throw new Error('could not parse args in autoInject\nSource:\n' + src)
        let [, args] = match;
        return args
            .replace(/\s/g, '')
            .split(FN_ARG_SPLIT)
            .map((arg) => arg.replace(FN_ARG, '').trim());
    }

    /**
     * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
     * tasks are specified as parameters to the function, after the usual callback
     * parameter, with the parameter names matching the names of the tasks it
     * depends on. This can provide even more readable task graphs which can be
     * easier to maintain.
     *
     * If a final callback is specified, the task results are similarly injected,
     * specified as named parameters after the initial error parameter.
     *
     * The autoInject function is purely syntactic sugar and its semantics are
     * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
     *
     * @name autoInject
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.auto]{@link module:ControlFlow.auto}
     * @category Control Flow
     * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
     * the form 'func([dependencies...], callback). The object's key of a property
     * serves as the name of the task defined by that property, i.e. can be used
     * when specifying requirements for other tasks.
     * * The `callback` parameter is a `callback(err, result)` which must be called
     *   when finished, passing an `error` (which can be `null`) and the result of
     *   the function's execution. The remaining parameters name other tasks on
     *   which the task is dependent, and the results from those tasks are the
     *   arguments of those parameters.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback, and a `results` object with any completed
     * task results, similar to `auto`.
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * //  The example from `auto` can be rewritten as follows:
     * async.autoInject({
     *     get_data: function(callback) {
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: function(get_data, make_folder, callback) {
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     },
     *     email_link: function(write_file, callback) {
     *         // once the file is written let's email a link to it...
     *         // write_file contains the filename returned by write_file.
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', results.email_link);
     * });
     *
     * // If you are using a JS minifier that mangles parameter names, `autoInject`
     * // will not work with plain functions, since the parameter names will be
     * // collapsed to a single letter identifier.  To work around this, you can
     * // explicitly specify the names of the parameters your task function needs
     * // in an array, similar to Angular.js dependency injection.
     *
     * // This still has an advantage over plain `auto`, since the results a task
     * // depends on are still spread into arguments.
     * async.autoInject({
     *     //...
     *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(write_file, callback) {
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }]
     *     //...
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', results.email_link);
     * });
     */
    function autoInject(tasks, callback) {
        var newTasks = {};

        Object.keys(tasks).forEach(key => {
            var taskFn = tasks[key];
            var params;
            var fnIsAsync = isAsync(taskFn);
            var hasNoDeps =
                (!fnIsAsync && taskFn.length === 1) ||
                (fnIsAsync && taskFn.length === 0);

            if (Array.isArray(taskFn)) {
                params = [...taskFn];
                taskFn = params.pop();

                newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
            } else if (hasNoDeps) {
                // no dependencies, use the function as-is
                newTasks[key] = taskFn;
            } else {
                params = parseParams(taskFn);
                if ((taskFn.length === 0 && !fnIsAsync) && params.length === 0) {
                    throw new Error("autoInject task functions require explicit parameters.");
                }

                // remove callback param
                if (!fnIsAsync) params.pop();

                newTasks[key] = params.concat(newTask);
            }

            function newTask(results, taskCb) {
                var newArgs = params.map(name => results[name]);
                newArgs.push(taskCb);
                wrapAsync(taskFn)(...newArgs);
            }
        });

        return auto(newTasks, callback);
    }

    // Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
    // used for queues. This implementation assumes that the node provided by the user can be modified
    // to adjust the next and last properties. We implement only the minimal functionality
    // for queue support.
    class DLL {
        constructor() {
            this.head = this.tail = null;
            this.length = 0;
        }

        removeLink(node) {
            if (node.prev) node.prev.next = node.next;
            else this.head = node.next;
            if (node.next) node.next.prev = node.prev;
            else this.tail = node.prev;

            node.prev = node.next = null;
            this.length -= 1;
            return node;
        }

        empty () {
            while(this.head) this.shift();
            return this;
        }

        insertAfter(node, newNode) {
            newNode.prev = node;
            newNode.next = node.next;
            if (node.next) node.next.prev = newNode;
            else this.tail = newNode;
            node.next = newNode;
            this.length += 1;
        }

        insertBefore(node, newNode) {
            newNode.prev = node.prev;
            newNode.next = node;
            if (node.prev) node.prev.next = newNode;
            else this.head = newNode;
            node.prev = newNode;
            this.length += 1;
        }

        unshift(node) {
            if (this.head) this.insertBefore(this.head, node);
            else setInitial(this, node);
        }

        push(node) {
            if (this.tail) this.insertAfter(this.tail, node);
            else setInitial(this, node);
        }

        shift() {
            return this.head && this.removeLink(this.head);
        }

        pop() {
            return this.tail && this.removeLink(this.tail);
        }

        toArray() {
            return [...this]
        }

        *[Symbol.iterator] () {
            var cur = this.head;
            while (cur) {
                yield cur.data;
                cur = cur.next;
            }
        }

        remove (testFn) {
            var curr = this.head;
            while(curr) {
                var {next} = curr;
                if (testFn(curr)) {
                    this.removeLink(curr);
                }
                curr = next;
            }
            return this;
        }
    }

    function setInitial(dll, node) {
        dll.length = 1;
        dll.head = dll.tail = node;
    }

    function queue$1(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new RangeError('Concurrency must not be zero');
        }

        var _worker = wrapAsync(worker);
        var numRunning = 0;
        var workersList = [];
        const events = {
            error: [],
            drain: [],
            saturated: [],
            unsaturated: [],
            empty: []
        };

        function on (event, handler) {
            events[event].push(handler);
        }

        function once (event, handler) {
            const handleAndRemove = (...args) => {
                off(event, handleAndRemove);
                handler(...args);
            };
            events[event].push(handleAndRemove);
        }

        function off (event, handler) {
            if (!event) return Object.keys(events).forEach(ev => events[ev] = [])
            if (!handler) return events[event] = []
            events[event] = events[event].filter(ev => ev !== handler);
        }

        function trigger (event, ...args) {
            events[event].forEach(handler => handler(...args));
        }

        var processingScheduled = false;
        function _insert(data, insertAtFront, rejectOnError, callback) {
            if (callback != null && typeof callback !== 'function') {
                throw new Error('task callback must be a function');
            }
            q.started = true;

            var res, rej;
            function promiseCallback (err, ...args) {
                // we don't care about the error, let the global error handler
                // deal with it
                if (err) return rejectOnError ? rej(err) : res()
                if (args.length <= 1) return res(args[0])
                res(args);
            }

            var item = q._createTaskItem(
                data,
                rejectOnError ? promiseCallback :
                    (callback || promiseCallback)
            );

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }

            if (!processingScheduled) {
                processingScheduled = true;
                setImmediate$1(() => {
                    processingScheduled = false;
                    q.process();
                });
            }

            if (rejectOnError || !callback) {
                return new Promise((resolve, reject) => {
                    res = resolve;
                    rej = reject;
                })
            }
        }

        function _createCB(tasks) {
            return function (err, ...args) {
                numRunning -= 1;

                for (var i = 0, l = tasks.length; i < l; i++) {
                    var task = tasks[i];

                    var index = workersList.indexOf(task);
                    if (index === 0) {
                        workersList.shift();
                    } else if (index > 0) {
                        workersList.splice(index, 1);
                    }

                    task.callback(err, ...args);

                    if (err != null) {
                        trigger('error', err, task.data);
                    }
                }

                if (numRunning <= (q.concurrency - q.buffer) ) {
                    trigger('unsaturated');
                }

                if (q.idle()) {
                    trigger('drain');
                }
                q.process();
            };
        }

        function _maybeDrain(data) {
            if (data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                setImmediate$1(() => trigger('drain'));
                return true
            }
            return false
        }

        const eventMethod = (name) => (handler) => {
            if (!handler) {
                return new Promise((resolve, reject) => {
                    once(name, (err, data) => {
                        if (err) return reject(err)
                        resolve(data);
                    });
                })
            }
            off(name);
            on(name, handler);

        };

        var isProcessing = false;
        var q = {
            _tasks: new DLL(),
            _createTaskItem (data, callback) {
                return {
                    data,
                    callback
                };
            },
            *[Symbol.iterator] () {
                yield* q._tasks[Symbol.iterator]();
            },
            concurrency,
            payload,
            buffer: concurrency / 4,
            started: false,
            paused: false,
            push (data, callback) {
                if (Array.isArray(data)) {
                    if (_maybeDrain(data)) return
                    return data.map(datum => _insert(datum, false, false, callback))
                }
                return _insert(data, false, false, callback);
            },
            pushAsync (data, callback) {
                if (Array.isArray(data)) {
                    if (_maybeDrain(data)) return
                    return data.map(datum => _insert(datum, false, true, callback))
                }
                return _insert(data, false, true, callback);
            },
            kill () {
                off();
                q._tasks.empty();
            },
            unshift (data, callback) {
                if (Array.isArray(data)) {
                    if (_maybeDrain(data)) return
                    return data.map(datum => _insert(datum, true, false, callback))
                }
                return _insert(data, true, false, callback);
            },
            unshiftAsync (data, callback) {
                if (Array.isArray(data)) {
                    if (_maybeDrain(data)) return
                    return data.map(datum => _insert(datum, true, true, callback))
                }
                return _insert(data, true, true, callback);
            },
            remove (testFn) {
                q._tasks.remove(testFn);
            },
            process () {
                // Avoid trying to start too many processing operations. This can occur
                // when callbacks resolve synchronously (#1267).
                if (isProcessing) {
                    return;
                }
                isProcessing = true;
                while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                    var tasks = [], data = [];
                    var l = q._tasks.length;
                    if (q.payload) l = Math.min(l, q.payload);
                    for (var i = 0; i < l; i++) {
                        var node = q._tasks.shift();
                        tasks.push(node);
                        workersList.push(node);
                        data.push(node.data);
                    }

                    numRunning += 1;

                    if (q._tasks.length === 0) {
                        trigger('empty');
                    }

                    if (numRunning === q.concurrency) {
                        trigger('saturated');
                    }

                    var cb = onlyOnce(_createCB(tasks));
                    _worker(data, cb);
                }
                isProcessing = false;
            },
            length () {
                return q._tasks.length;
            },
            running () {
                return numRunning;
            },
            workersList () {
                return workersList;
            },
            idle() {
                return q._tasks.length + numRunning === 0;
            },
            pause () {
                q.paused = true;
            },
            resume () {
                if (q.paused === false) { return; }
                q.paused = false;
                setImmediate$1(q.process);
            }
        };
        // define these as fixed properties, so people get useful errors when updating
        Object.defineProperties(q, {
            saturated: {
                writable: false,
                value: eventMethod('saturated')
            },
            unsaturated: {
                writable: false,
                value: eventMethod('unsaturated')
            },
            empty: {
                writable: false,
                value: eventMethod('empty')
            },
            drain: {
                writable: false,
                value: eventMethod('drain')
            },
            error: {
                writable: false,
                value: eventMethod('error')
            },
        });
        return q;
    }

    /**
     * Creates a `cargo` object with the specified payload. Tasks added to the
     * cargo will be processed altogether (up to the `payload` limit). If the
     * `worker` is in progress, the task is queued until it becomes available. Once
     * the `worker` has completed some tasks, each callback of those tasks is
     * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
     * for how `cargo` and `queue` work.
     *
     * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
     * at a time, cargo passes an array of tasks to a single worker, repeating
     * when the worker is finished.
     *
     * @name cargo
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.queue]{@link module:ControlFlow.queue}
     * @category Control Flow
     * @param {AsyncFunction} worker - An asynchronous function for processing an array
     * of queued tasks. Invoked with `(tasks, callback)`.
     * @param {number} [payload=Infinity] - An optional `integer` for determining
     * how many tasks should be processed per round; if omitted, the default is
     * unlimited.
     * @returns {module:ControlFlow.QueueObject} A cargo object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the cargo and inner queue.
     * @example
     *
     * // create a cargo object with payload 2
     * var cargo = async.cargo(function(tasks, callback) {
     *     for (var i=0; i<tasks.length; i++) {
     *         console.log('hello ' + tasks[i].name);
     *     }
     *     callback();
     * }, 2);
     *
     * // add some items
     * cargo.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * cargo.push({name: 'bar'}, function(err) {
     *     console.log('finished processing bar');
     * });
     * await cargo.push({name: 'baz'});
     * console.log('finished processing baz');
     */
    function cargo$1(worker, payload) {
        return queue$1(worker, 1, payload);
    }

    /**
     * Creates a `cargoQueue` object with the specified payload. Tasks added to the
     * cargoQueue will be processed together (up to the `payload` limit) in `concurrency` parallel workers.
     * If the all `workers` are in progress, the task is queued until one becomes available. Once
     * a `worker` has completed some tasks, each callback of those tasks is
     * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
     * for how `cargo` and `queue` work.
     *
     * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
     * at a time, and [`cargo`]{@link module:ControlFlow.cargo} passes an array of tasks to a single worker,
     * the cargoQueue passes an array of tasks to multiple parallel workers.
     *
     * @name cargoQueue
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.queue]{@link module:ControlFlow.queue}
     * @see [async.cargo]{@link module:ControlFLow.cargo}
     * @category Control Flow
     * @param {AsyncFunction} worker - An asynchronous function for processing an array
     * of queued tasks. Invoked with `(tasks, callback)`.
     * @param {number} [concurrency=1] - An `integer` for determining how many
     * `worker` functions should be run in parallel.  If omitted, the concurrency
     * defaults to `1`.  If the concurrency is `0`, an error is thrown.
     * @param {number} [payload=Infinity] - An optional `integer` for determining
     * how many tasks should be processed per round; if omitted, the default is
     * unlimited.
     * @returns {module:ControlFlow.QueueObject} A cargoQueue object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the cargoQueue and inner queue.
     * @example
     *
     * // create a cargoQueue object with payload 2 and concurrency 2
     * var cargoQueue = async.cargoQueue(function(tasks, callback) {
     *     for (var i=0; i<tasks.length; i++) {
     *         console.log('hello ' + tasks[i].name);
     *     }
     *     callback();
     * }, 2, 2);
     *
     * // add some items
     * cargoQueue.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * cargoQueue.push({name: 'bar'}, function(err) {
     *     console.log('finished processing bar');
     * });
     * cargoQueue.push({name: 'baz'}, function(err) {
     *     console.log('finished processing baz');
     * });
     * cargoQueue.push({name: 'boo'}, function(err) {
     *     console.log('finished processing boo');
     * });
     */
    function cargo(worker, concurrency, payload) {
        return queue$1(worker, concurrency, payload);
    }

    /**
     * Reduces `coll` into a single value using an async `iteratee` to return each
     * successive step. `memo` is the initial state of the reduction. This function
     * only operates in series.
     *
     * For performance reasons, it may make sense to split a call to this function
     * into a parallel map, and then use the normal `Array.prototype.reduce` on the
     * results. This function is for situations where each step in the reduction
     * needs to be async; if you can get the data before reducing it, then it's
     * probably a good idea to do so.
     *
     * @name reduce
     * @static
     * @memberOf module:Collections
     * @method
     * @alias inject
     * @alias foldl
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {AsyncFunction} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction.
     * The `iteratee` should complete with the next state of the reduction.
     * If the iteratee completes with an error, the reduction is stopped and the
     * main `callback` is immediately called with the error.
     * Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * // file1.txt is a file that is 1000 bytes in size
     * // file2.txt is a file that is 2000 bytes in size
     * // file3.txt is a file that is 3000 bytes in size
     * // file4.txt does not exist
     *
     * const fileList = ['file1.txt','file2.txt','file3.txt'];
     * const withMissingFileList = ['file1.txt','file2.txt','file3.txt', 'file4.txt'];
     *
     * // asynchronous function that computes the file size in bytes
     * // file size is added to the memoized value, then returned
     * function getFileSizeInBytes(memo, file, callback) {
     *     fs.stat(file, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         callback(null, memo + stat.size);
     *     });
     * }
     *
     * // Using callbacks
     * async.reduce(fileList, 0, getFileSizeInBytes, function(err, result) {
     *     if (err) {
     *         console.log(err);
     *     } else {
     *         console.log(result);
     *         // 6000
     *         // which is the sum of the file sizes of the three files
     *     }
     * });
     *
     * // Error Handling
     * async.reduce(withMissingFileList, 0, getFileSizeInBytes, function(err, result) {
     *     if (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     } else {
     *         console.log(result);
     *     }
     * });
     *
     * // Using Promises
     * async.reduce(fileList, 0, getFileSizeInBytes)
     * .then( result => {
     *     console.log(result);
     *     // 6000
     *     // which is the sum of the file sizes of the three files
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Error Handling
     * async.reduce(withMissingFileList, 0, getFileSizeInBytes)
     * .then( result => {
     *     console.log(result);
     * }).catch( err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.reduce(fileList, 0, getFileSizeInBytes);
     *         console.log(result);
     *         // 6000
     *         // which is the sum of the file sizes of the three files
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // Error Handling
     * async () => {
     *     try {
     *         let result = await async.reduce(withMissingFileList, 0, getFileSizeInBytes);
     *         console.log(result);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     }
     * }
     *
     */
    function reduce(coll, memo, iteratee, callback) {
        callback = once(callback);
        var _iteratee = wrapAsync(iteratee);
        return eachOfSeries$1(coll, (x, i, iterCb) => {
            _iteratee(memo, x, (err, v) => {
                memo = v;
                iterCb(err);
            });
        }, err => callback(err, memo));
    }
    var reduce$1 = awaitify(reduce, 4);

    /**
     * Version of the compose function that is more natural to read. Each function
     * consumes the return value of the previous function. It is the equivalent of
     * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name seq
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.compose]{@link module:ControlFlow.compose}
     * @category Control Flow
     * @param {...AsyncFunction} functions - the asynchronous functions to compose
     * @returns {Function} a function that composes the `functions` in order
     * @example
     *
     * // Requires lodash (or underscore), express3 and dresende's orm2.
     * // Part of an app, that fetches cats of the logged user.
     * // This example uses `seq` function to avoid overnesting and error
     * // handling clutter.
     * app.get('/cats', function(request, response) {
     *     var User = request.models.User;
     *     async.seq(
     *         User.get.bind(User),  // 'User.get' has signature (id, callback(err, data))
     *         function(user, fn) {
     *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
     *         }
     *     )(req.session.user_id, function (err, cats) {
     *         if (err) {
     *             console.error(err);
     *             response.json({ status: 'error', message: err.message });
     *         } else {
     *             response.json({ status: 'ok', message: 'Cats found', data: cats });
     *         }
     *     });
     * });
     */
    function seq(...functions) {
        var _functions = functions.map(wrapAsync);
        return function (...args) {
            var that = this;

            var cb = args[args.length - 1];
            if (typeof cb == 'function') {
                args.pop();
            } else {
                cb = promiseCallback();
            }

            reduce$1(_functions, args, (newargs, fn, iterCb) => {
                fn.apply(that, newargs.concat((err, ...nextargs) => {
                    iterCb(err, nextargs);
                }));
            },
            (err, results) => cb(err, ...results));

            return cb[PROMISE_SYMBOL]
        };
    }

    /**
     * Creates a function which is a composition of the passed asynchronous
     * functions. Each function consumes the return value of the function that
     * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
     * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
     *
     * If the last argument to the composed function is not a function, a promise
     * is returned when you call it.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name compose
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {...AsyncFunction} functions - the asynchronous functions to compose
     * @returns {Function} an asynchronous function that is the composed
     * asynchronous `functions`
     * @example
     *
     * function add1(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n + 1);
     *     }, 10);
     * }
     *
     * function mul3(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n * 3);
     *     }, 10);
     * }
     *
     * var add1mul3 = async.compose(mul3, add1);
     * add1mul3(4, function (err, result) {
     *     // result now equals 15
     * });
     */
    function compose(...args) {
        return seq(...args.reverse());
    }

    /**
     * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
     *
     * @name mapLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with the transformed item.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     */
    function mapLimit (coll, limit, iteratee, callback) {
        return _asyncMap(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var mapLimit$1 = awaitify(mapLimit, 4);

    /**
     * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
     *
     * @name concatLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.concat]{@link module:Collections.concat}
     * @category Collection
     * @alias flatMapLimit
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
     * which should use an array as its result. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     * @returns A Promise, if no callback is passed
     */
    function concatLimit(coll, limit, iteratee, callback) {
        var _iteratee = wrapAsync(iteratee);
        return mapLimit$1(coll, limit, (val, iterCb) => {
            _iteratee(val, (err, ...args) => {
                if (err) return iterCb(err);
                return iterCb(err, args);
            });
        }, (err, mapResults) => {
            var result = [];
            for (var i = 0; i < mapResults.length; i++) {
                if (mapResults[i]) {
                    result = result.concat(...mapResults[i]);
                }
            }

            return callback(err, result);
        });
    }
    var concatLimit$1 = awaitify(concatLimit, 4);

    /**
     * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
     * the concatenated list. The `iteratee`s are called in parallel, and the
     * results are concatenated as they return. The results array will be returned in
     * the original order of `coll` passed to the `iteratee` function.
     *
     * @name concat
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @alias flatMap
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
     * which should use an array as its result. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     * @returns A Promise, if no callback is passed
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     * // dir4 does not exist
     *
     * let directoryList = ['dir1','dir2','dir3'];
     * let withMissingDirectoryList = ['dir1','dir2','dir3', 'dir4'];
     *
     * // Using callbacks
     * async.concat(directoryList, fs.readdir, function(err, results) {
     *    if (err) {
     *        console.log(err);
     *    } else {
     *        console.log(results);
     *        // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
     *    }
     * });
     *
     * // Error Handling
     * async.concat(withMissingDirectoryList, fs.readdir, function(err, results) {
     *    if (err) {
     *        console.log(err);
     *        // [ Error: ENOENT: no such file or directory ]
     *        // since dir4 does not exist
     *    } else {
     *        console.log(results);
     *    }
     * });
     *
     * // Using Promises
     * async.concat(directoryList, fs.readdir)
     * .then(results => {
     *     console.log(results);
     *     // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
     * }).catch(err => {
     *      console.log(err);
     * });
     *
     * // Error Handling
     * async.concat(withMissingDirectoryList, fs.readdir)
     * .then(results => {
     *     console.log(results);
     * }).catch(err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     *     // since dir4 does not exist
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let results = await async.concat(directoryList, fs.readdir);
     *         console.log(results);
     *         // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
     *     } catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // Error Handling
     * async () => {
     *     try {
     *         let results = await async.concat(withMissingDirectoryList, fs.readdir);
     *         console.log(results);
     *     } catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *         // since dir4 does not exist
     *     }
     * }
     *
     */
    function concat(coll, iteratee, callback) {
        return concatLimit$1(coll, Infinity, iteratee, callback)
    }
    var concat$1 = awaitify(concat, 3);

    /**
     * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
     *
     * @name concatSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.concat]{@link module:Collections.concat}
     * @category Collection
     * @alias flatMapSeries
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
     * The iteratee should complete with an array an array of results.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     * @returns A Promise, if no callback is passed
     */
    function concatSeries(coll, iteratee, callback) {
        return concatLimit$1(coll, 1, iteratee, callback)
    }
    var concatSeries$1 = awaitify(concatSeries, 3);

    /**
     * Returns a function that when called, calls-back with the values provided.
     * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
     * [`auto`]{@link module:ControlFlow.auto}.
     *
     * @name constant
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {...*} arguments... - Any number of arguments to automatically invoke
     * callback with.
     * @returns {AsyncFunction} Returns a function that when invoked, automatically
     * invokes the callback with the previous given arguments.
     * @example
     *
     * async.waterfall([
     *     async.constant(42),
     *     function (value, next) {
     *         // value === 42
     *     },
     *     //...
     * ], callback);
     *
     * async.waterfall([
     *     async.constant(filename, "utf8"),
     *     fs.readFile,
     *     function (fileData, next) {
     *         //...
     *     }
     *     //...
     * ], callback);
     *
     * async.auto({
     *     hostname: async.constant("https://server.net/"),
     *     port: findFreePort,
     *     launchServer: ["hostname", "port", function (options, cb) {
     *         startServer(options, cb);
     *     }],
     *     //...
     * }, callback);
     */
    function constant$1(...args) {
        return function (...ignoredArgs/*, callback*/) {
            var callback = ignoredArgs.pop();
            return callback(null, ...args);
        };
    }

    function _createTester(check, getResult) {
        return (eachfn, arr, _iteratee, cb) => {
            var testPassed = false;
            var testResult;
            const iteratee = wrapAsync(_iteratee);
            eachfn(arr, (value, _, callback) => {
                iteratee(value, (err, result) => {
                    if (err || err === false) return callback(err);

                    if (check(result) && !testResult) {
                        testPassed = true;
                        testResult = getResult(true, value);
                        return callback(null, breakLoop$1);
                    }
                    callback();
                });
            }, err => {
                if (err) return cb(err);
                cb(null, testPassed ? testResult : getResult(false));
            });
        };
    }

    /**
     * Returns the first value in `coll` that passes an async truth test. The
     * `iteratee` is applied in parallel, meaning the first iteratee to return
     * `true` will fire the detect `callback` with that result. That means the
     * result might not be the first item in the original `coll` (in terms of order)
     * that passes the test.

     * If order within the original `coll` is important, then look at
     * [`detectSeries`]{@link module:Collections.detectSeries}.
     *
     * @name detect
     * @static
     * @memberOf module:Collections
     * @method
     * @alias find
     * @category Collections
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee must complete with a boolean value as its result.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     * @returns {Promise} a promise, if a callback is omitted
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     *
     * // asynchronous function that checks if a file exists
     * function fileExists(file, callback) {
     *    fs.access(file, fs.constants.F_OK, (err) => {
     *        callback(null, !err);
     *    });
     * }
     *
     * async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists,
     *    function(err, result) {
     *        console.log(result);
     *        // dir1/file1.txt
     *        // result now equals the first file in the list that exists
     *    }
     *);
     *
     * // Using Promises
     * async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists)
     * .then(result => {
     *     console.log(result);
     *     // dir1/file1.txt
     *     // result now equals the first file in the list that exists
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists);
     *         console.log(result);
     *         // dir1/file1.txt
     *         // result now equals the file in the list that exists
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function detect(coll, iteratee, callback) {
        return _createTester(bool => bool, (res, item) => item)(eachOf$1, coll, iteratee, callback)
    }
    var detect$1 = awaitify(detect, 3);

    /**
     * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name detectLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.detect]{@link module:Collections.detect}
     * @alias findLimit
     * @category Collections
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee must complete with a boolean value as its result.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function detectLimit(coll, limit, iteratee, callback) {
        return _createTester(bool => bool, (res, item) => item)(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var detectLimit$1 = awaitify(detectLimit, 4);

    /**
     * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
     *
     * @name detectSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.detect]{@link module:Collections.detect}
     * @alias findSeries
     * @category Collections
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee must complete with a boolean value as its result.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function detectSeries(coll, iteratee, callback) {
        return _createTester(bool => bool, (res, item) => item)(eachOfLimit$2(1), coll, iteratee, callback)
    }

    var detectSeries$1 = awaitify(detectSeries, 3);

    function consoleFunc(name) {
        return (fn, ...args) => wrapAsync(fn)(...args, (err, ...resultArgs) => {
            /* istanbul ignore else */
            if (typeof console === 'object') {
                /* istanbul ignore else */
                if (err) {
                    /* istanbul ignore else */
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) { /* istanbul ignore else */
                    resultArgs.forEach(x => console[name](x));
                }
            }
        })
    }

    /**
     * Logs the result of an [`async` function]{@link AsyncFunction} to the
     * `console` using `console.dir` to display the properties of the resulting object.
     * Only works in Node.js or in browsers that support `console.dir` and
     * `console.error` (such as FF and Chrome).
     * If multiple arguments are returned from the async function,
     * `console.dir` is called on each argument in order.
     *
     * @name dir
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} function - The function you want to eventually apply
     * all arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, {hello: name});
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.dir(hello, 'world');
     * {hello: 'world'}
     */
    var dir = consoleFunc('dir');

    /**
     * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
     * the order of operations, the arguments `test` and `iteratee` are switched.
     *
     * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
     *
     * @name doWhilst
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.whilst]{@link module:ControlFlow.whilst}
     * @category Control Flow
     * @param {AsyncFunction} iteratee - A function which is called each time `test`
     * passes. Invoked with (callback).
     * @param {AsyncFunction} test - asynchronous truth test to perform after each
     * execution of `iteratee`. Invoked with (...args, callback), where `...args` are the
     * non-error args from the previous callback of `iteratee`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `iteratee` has stopped.
     * `callback` will be passed an error and any arguments passed to the final
     * `iteratee`'s callback. Invoked with (err, [results]);
     * @returns {Promise} a promise, if no callback is passed
     */
    function doWhilst(iteratee, test, callback) {
        callback = onlyOnce(callback);
        var _fn = wrapAsync(iteratee);
        var _test = wrapAsync(test);
        var results;

        function next(err, ...args) {
            if (err) return callback(err);
            if (err === false) return;
            results = args;
            _test(...args, check);
        }

        function check(err, truth) {
            if (err) return callback(err);
            if (err === false) return;
            if (!truth) return callback(null, ...results);
            _fn(next);
        }

        return check(null, true);
    }

    var doWhilst$1 = awaitify(doWhilst, 3);

    /**
     * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
     * argument ordering differs from `until`.
     *
     * @name doUntil
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
     * @category Control Flow
     * @param {AsyncFunction} iteratee - An async function which is called each time
     * `test` fails. Invoked with (callback).
     * @param {AsyncFunction} test - asynchronous truth test to perform after each
     * execution of `iteratee`. Invoked with (...args, callback), where `...args` are the
     * non-error args from the previous callback of `iteratee`
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `iteratee` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `iteratee`'s
     * callback. Invoked with (err, [results]);
     * @returns {Promise} a promise, if no callback is passed
     */
    function doUntil(iteratee, test, callback) {
        const _test = wrapAsync(test);
        return doWhilst$1(iteratee, (...args) => {
            const cb = args.pop();
            _test(...args, (err, truth) => cb (err, !truth));
        }, callback);
    }

    function _withoutIndex(iteratee) {
        return (value, index, callback) => iteratee(value, callback);
    }

    /**
     * Applies the function `iteratee` to each item in `coll`, in parallel.
     * The `iteratee` is called with an item from the list, and a callback for when
     * it has finished. If the `iteratee` passes an error to its `callback`, the
     * main `callback` (for the `each` function) is immediately called with the
     * error.
     *
     * Note, that since this function applies `iteratee` to each item in parallel,
     * there is no guarantee that the iteratee functions will complete in order.
     *
     * @name each
     * @static
     * @memberOf module:Collections
     * @method
     * @alias forEach
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to
     * each item in `coll`. Invoked with (item, callback).
     * The array index is not passed to the iteratee.
     * If you need the index, use `eachOf`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     * // dir4 does not exist
     *
     * const fileList = [ 'dir1/file2.txt', 'dir2/file3.txt', 'dir/file5.txt'];
     * const withMissingFileList = ['dir1/file1.txt', 'dir4/file2.txt'];
     *
     * // asynchronous function that deletes a file
     * const deleteFile = function(file, callback) {
     *     fs.unlink(file, callback);
     * };
     *
     * // Using callbacks
     * async.each(fileList, deleteFile, function(err) {
     *     if( err ) {
     *         console.log(err);
     *     } else {
     *         console.log('All files have been deleted successfully');
     *     }
     * });
     *
     * // Error Handling
     * async.each(withMissingFileList, deleteFile, function(err){
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     *     // since dir4/file2.txt does not exist
     *     // dir1/file1.txt could have been deleted
     * });
     *
     * // Using Promises
     * async.each(fileList, deleteFile)
     * .then( () => {
     *     console.log('All files have been deleted successfully');
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Error Handling
     * async.each(fileList, deleteFile)
     * .then( () => {
     *     console.log('All files have been deleted successfully');
     * }).catch( err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     *     // since dir4/file2.txt does not exist
     *     // dir1/file1.txt could have been deleted
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         await async.each(files, deleteFile);
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // Error Handling
     * async () => {
     *     try {
     *         await async.each(withMissingFileList, deleteFile);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *         // since dir4/file2.txt does not exist
     *         // dir1/file1.txt could have been deleted
     *     }
     * }
     *
     */
    function eachLimit$2(coll, iteratee, callback) {
        return eachOf$1(coll, _withoutIndex(wrapAsync(iteratee)), callback);
    }

    var each = awaitify(eachLimit$2, 3);

    /**
     * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
     *
     * @name eachLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.each]{@link module:Collections.each}
     * @alias forEachLimit
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The array index is not passed to the iteratee.
     * If you need the index, use `eachOfLimit`.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function eachLimit(coll, limit, iteratee, callback) {
        return eachOfLimit$2(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
    }
    var eachLimit$1 = awaitify(eachLimit, 4);

    /**
     * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
     *
     * Note, that unlike [`each`]{@link module:Collections.each}, this function applies iteratee to each item
     * in series and therefore the iteratee functions will complete in order.

     * @name eachSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.each]{@link module:Collections.each}
     * @alias forEachSeries
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each
     * item in `coll`.
     * The array index is not passed to the iteratee.
     * If you need the index, use `eachOfSeries`.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @returns {Promise} a promise, if a callback is omitted
     */
    function eachSeries(coll, iteratee, callback) {
        return eachLimit$1(coll, 1, iteratee, callback)
    }
    var eachSeries$1 = awaitify(eachSeries, 3);

    /**
     * Wrap an async function and ensure it calls its callback on a later tick of
     * the event loop.  If the function already calls its callback on a next tick,
     * no extra deferral is added. This is useful for preventing stack overflows
     * (`RangeError: Maximum call stack size exceeded`) and generally keeping
     * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
     * contained. ES2017 `async` functions are returned as-is -- they are immune
     * to Zalgo's corrupting influences, as they always resolve on a later tick.
     *
     * @name ensureAsync
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} fn - an async function, one that expects a node-style
     * callback as its last argument.
     * @returns {AsyncFunction} Returns a wrapped function with the exact same call
     * signature as the function passed in.
     * @example
     *
     * function sometimesAsync(arg, callback) {
     *     if (cache[arg]) {
     *         return callback(null, cache[arg]); // this would be synchronous!!
     *     } else {
     *         doSomeIO(arg, callback); // this IO would be asynchronous
     *     }
     * }
     *
     * // this has a risk of stack overflows if many results are cached in a row
     * async.mapSeries(args, sometimesAsync, done);
     *
     * // this will defer sometimesAsync's callback if necessary,
     * // preventing stack overflows
     * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
     */
    function ensureAsync(fn) {
        if (isAsync(fn)) return fn;
        return function (...args/*, callback*/) {
            var callback = args.pop();
            var sync = true;
            args.push((...innerArgs) => {
                if (sync) {
                    setImmediate$1(() => callback(...innerArgs));
                } else {
                    callback(...innerArgs);
                }
            });
            fn.apply(this, args);
            sync = false;
        };
    }

    /**
     * Returns `true` if every element in `coll` satisfies an async test. If any
     * iteratee call returns `false`, the main `callback` is immediately called.
     *
     * @name every
     * @static
     * @memberOf module:Collections
     * @method
     * @alias all
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collection in parallel.
     * The iteratee must complete with a boolean result value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     * // dir4 does not exist
     *
     * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir3/file5.txt'];
     * const withMissingFileList = ['file1.txt','file2.txt','file4.txt'];
     *
     * // asynchronous function that checks if a file exists
     * function fileExists(file, callback) {
     *    fs.access(file, fs.constants.F_OK, (err) => {
     *        callback(null, !err);
     *    });
     * }
     *
     * // Using callbacks
     * async.every(fileList, fileExists, function(err, result) {
     *     console.log(result);
     *     // true
     *     // result is true since every file exists
     * });
     *
     * async.every(withMissingFileList, fileExists, function(err, result) {
     *     console.log(result);
     *     // false
     *     // result is false since NOT every file exists
     * });
     *
     * // Using Promises
     * async.every(fileList, fileExists)
     * .then( result => {
     *     console.log(result);
     *     // true
     *     // result is true since every file exists
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * async.every(withMissingFileList, fileExists)
     * .then( result => {
     *     console.log(result);
     *     // false
     *     // result is false since NOT every file exists
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.every(fileList, fileExists);
     *         console.log(result);
     *         // true
     *         // result is true since every file exists
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * async () => {
     *     try {
     *         let result = await async.every(withMissingFileList, fileExists);
     *         console.log(result);
     *         // false
     *         // result is false since NOT every file exists
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function every(coll, iteratee, callback) {
        return _createTester(bool => !bool, res => !res)(eachOf$1, coll, iteratee, callback)
    }
    var every$1 = awaitify(every, 3);

    /**
     * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
     *
     * @name everyLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.every]{@link module:Collections.every}
     * @alias allLimit
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collection in parallel.
     * The iteratee must complete with a boolean result value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     */
    function everyLimit(coll, limit, iteratee, callback) {
        return _createTester(bool => !bool, res => !res)(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var everyLimit$1 = awaitify(everyLimit, 4);

    /**
     * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
     *
     * @name everySeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.every]{@link module:Collections.every}
     * @alias allSeries
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collection in series.
     * The iteratee must complete with a boolean result value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     */
    function everySeries(coll, iteratee, callback) {
        return _createTester(bool => !bool, res => !res)(eachOfSeries$1, coll, iteratee, callback)
    }
    var everySeries$1 = awaitify(everySeries, 3);

    function filterArray(eachfn, arr, iteratee, callback) {
        var truthValues = new Array(arr.length);
        eachfn(arr, (x, index, iterCb) => {
            iteratee(x, (err, v) => {
                truthValues[index] = !!v;
                iterCb(err);
            });
        }, err => {
            if (err) return callback(err);
            var results = [];
            for (var i = 0; i < arr.length; i++) {
                if (truthValues[i]) results.push(arr[i]);
            }
            callback(null, results);
        });
    }

    function filterGeneric(eachfn, coll, iteratee, callback) {
        var results = [];
        eachfn(coll, (x, index, iterCb) => {
            iteratee(x, (err, v) => {
                if (err) return iterCb(err);
                if (v) {
                    results.push({index, value: x});
                }
                iterCb(err);
            });
        }, err => {
            if (err) return callback(err);
            callback(null, results
                .sort((a, b) => a.index - b.index)
                .map(v => v.value));
        });
    }

    function _filter(eachfn, coll, iteratee, callback) {
        var filter = isArrayLike(coll) ? filterArray : filterGeneric;
        return filter(eachfn, coll, wrapAsync(iteratee), callback);
    }

    /**
     * Returns a new array of all the values in `coll` which pass an async truth
     * test. This operation is performed in parallel, but the results array will be
     * in the same order as the original.
     *
     * @name filter
     * @static
     * @memberOf module:Collections
     * @method
     * @alias select
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback provided
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     *
     * const files = ['dir1/file1.txt','dir2/file3.txt','dir3/file6.txt'];
     *
     * // asynchronous function that checks if a file exists
     * function fileExists(file, callback) {
     *    fs.access(file, fs.constants.F_OK, (err) => {
     *        callback(null, !err);
     *    });
     * }
     *
     * // Using callbacks
     * async.filter(files, fileExists, function(err, results) {
     *    if(err) {
     *        console.log(err);
     *    } else {
     *        console.log(results);
     *        // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
     *        // results is now an array of the existing files
     *    }
     * });
     *
     * // Using Promises
     * async.filter(files, fileExists)
     * .then(results => {
     *     console.log(results);
     *     // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
     *     // results is now an array of the existing files
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let results = await async.filter(files, fileExists);
     *         console.log(results);
     *         // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
     *         // results is now an array of the existing files
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function filter (coll, iteratee, callback) {
        return _filter(eachOf$1, coll, iteratee, callback)
    }
    var filter$1 = awaitify(filter, 3);

    /**
     * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name filterLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @alias selectLimit
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback provided
     */
    function filterLimit (coll, limit, iteratee, callback) {
        return _filter(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var filterLimit$1 = awaitify(filterLimit, 4);

    /**
     * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
     *
     * @name filterSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @alias selectSeries
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results)
     * @returns {Promise} a promise, if no callback provided
     */
    function filterSeries (coll, iteratee, callback) {
        return _filter(eachOfSeries$1, coll, iteratee, callback)
    }
    var filterSeries$1 = awaitify(filterSeries, 3);

    /**
     * Calls the asynchronous function `fn` with a callback parameter that allows it
     * to call itself again, in series, indefinitely.

     * If an error is passed to the callback then `errback` is called with the
     * error, and execution stops, otherwise it will never be called.
     *
     * @name forever
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {AsyncFunction} fn - an async function to call repeatedly.
     * Invoked with (next).
     * @param {Function} [errback] - when `fn` passes an error to it's callback,
     * this function will be called, and execution stops. Invoked with (err).
     * @returns {Promise} a promise that rejects if an error occurs and an errback
     * is not passed
     * @example
     *
     * async.forever(
     *     function(next) {
     *         // next is suitable for passing to things that need a callback(err [, whatever]);
     *         // it will result in this function being called again.
     *     },
     *     function(err) {
     *         // if next is called with a value in its first parameter, it will appear
     *         // in here as 'err', and execution will stop.
     *     }
     * );
     */
    function forever(fn, errback) {
        var done = onlyOnce(errback);
        var task = wrapAsync(ensureAsync(fn));

        function next(err) {
            if (err) return done(err);
            if (err === false) return;
            task(next);
        }
        return next();
    }
    var forever$1 = awaitify(forever, 2);

    /**
     * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
     *
     * @name groupByLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.groupBy]{@link module:Collections.groupBy}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with a `key` to group the value under.
     * Invoked with (value, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an `Object` whoses
     * properties are arrays of values which returned the corresponding key.
     * @returns {Promise} a promise, if no callback is passed
     */
    function groupByLimit(coll, limit, iteratee, callback) {
        var _iteratee = wrapAsync(iteratee);
        return mapLimit$1(coll, limit, (val, iterCb) => {
            _iteratee(val, (err, key) => {
                if (err) return iterCb(err);
                return iterCb(err, {key, val});
            });
        }, (err, mapResults) => {
            var result = {};
            // from MDN, handle object having an `hasOwnProperty` prop
            var {hasOwnProperty} = Object.prototype;

            for (var i = 0; i < mapResults.length; i++) {
                if (mapResults[i]) {
                    var {key} = mapResults[i];
                    var {val} = mapResults[i];

                    if (hasOwnProperty.call(result, key)) {
                        result[key].push(val);
                    } else {
                        result[key] = [val];
                    }
                }
            }

            return callback(err, result);
        });
    }

    var groupByLimit$1 = awaitify(groupByLimit, 4);

    /**
     * Returns a new object, where each value corresponds to an array of items, from
     * `coll`, that returned the corresponding key. That is, the keys of the object
     * correspond to the values passed to the `iteratee` callback.
     *
     * Note: Since this function applies the `iteratee` to each item in parallel,
     * there is no guarantee that the `iteratee` functions will complete in order.
     * However, the values for each key in the `result` will be in the same order as
     * the original `coll`. For Objects, the values will roughly be in the order of
     * the original Objects' keys (but this can vary across JavaScript engines).
     *
     * @name groupBy
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with a `key` to group the value under.
     * Invoked with (value, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an `Object` whoses
     * properties are arrays of values which returned the corresponding key.
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     * // dir4 does not exist
     *
     * const files = ['dir1/file1.txt','dir2','dir4']
     *
     * // asynchronous function that detects file type as none, file, or directory
     * function detectFile(file, callback) {
     *     fs.stat(file, function(err, stat) {
     *         if (err) {
     *             return callback(null, 'none');
     *         }
     *         callback(null, stat.isDirectory() ? 'directory' : 'file');
     *     });
     * }
     *
     * //Using callbacks
     * async.groupBy(files, detectFile, function(err, result) {
     *     if(err) {
     *         console.log(err);
     *     } else {
     *	       console.log(result);
     *         // {
     *         //     file: [ 'dir1/file1.txt' ],
     *         //     none: [ 'dir4' ],
     *         //     directory: [ 'dir2']
     *         // }
     *         // result is object containing the files grouped by type
     *     }
     * });
     *
     * // Using Promises
     * async.groupBy(files, detectFile)
     * .then( result => {
     *     console.log(result);
     *     // {
     *     //     file: [ 'dir1/file1.txt' ],
     *     //     none: [ 'dir4' ],
     *     //     directory: [ 'dir2']
     *     // }
     *     // result is object containing the files grouped by type
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.groupBy(files, detectFile);
     *         console.log(result);
     *         // {
     *         //     file: [ 'dir1/file1.txt' ],
     *         //     none: [ 'dir4' ],
     *         //     directory: [ 'dir2']
     *         // }
     *         // result is object containing the files grouped by type
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function groupBy (coll, iteratee, callback) {
        return groupByLimit$1(coll, Infinity, iteratee, callback)
    }

    /**
     * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
     *
     * @name groupBySeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.groupBy]{@link module:Collections.groupBy}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with a `key` to group the value under.
     * Invoked with (value, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an `Object` whose
     * properties are arrays of values which returned the corresponding key.
     * @returns {Promise} a promise, if no callback is passed
     */
    function groupBySeries (coll, iteratee, callback) {
        return groupByLimit$1(coll, 1, iteratee, callback)
    }

    /**
     * Logs the result of an `async` function to the `console`. Only works in
     * Node.js or in browsers that support `console.log` and `console.error` (such
     * as FF and Chrome). If multiple arguments are returned from the async
     * function, `console.log` is called on each argument in order.
     *
     * @name log
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} function - The function you want to eventually apply
     * all arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, 'hello ' + name);
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.log(hello, 'world');
     * 'hello world'
     */
    var log = consoleFunc('log');

    /**
     * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name mapValuesLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.mapValues]{@link module:Collections.mapValues}
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - A function to apply to each value and key
     * in `coll`.
     * The iteratee should complete with the transformed value as its result.
     * Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. `result` is a new object consisting
     * of each key from `obj`, with each transformed value on the right-hand side.
     * Invoked with (err, result).
     * @returns {Promise} a promise, if no callback is passed
     */
    function mapValuesLimit(obj, limit, iteratee, callback) {
        callback = once(callback);
        var newObj = {};
        var _iteratee = wrapAsync(iteratee);
        return eachOfLimit$2(limit)(obj, (val, key, next) => {
            _iteratee(val, key, (err, result) => {
                if (err) return next(err);
                newObj[key] = result;
                next(err);
            });
        }, err => callback(err, newObj));
    }

    var mapValuesLimit$1 = awaitify(mapValuesLimit, 4);

    /**
     * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
     *
     * Produces a new Object by mapping each value of `obj` through the `iteratee`
     * function. The `iteratee` is called each `value` and `key` from `obj` and a
     * callback for when it has finished processing. Each of these callbacks takes
     * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
     * passes an error to its callback, the main `callback` (for the `mapValues`
     * function) is immediately called with the error.
     *
     * Note, the order of the keys in the result is not guaranteed.  The keys will
     * be roughly in the order they complete, (but this is very engine-specific)
     *
     * @name mapValues
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A function to apply to each value and key
     * in `coll`.
     * The iteratee should complete with the transformed value as its result.
     * Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. `result` is a new object consisting
     * of each key from `obj`, with each transformed value on the right-hand side.
     * Invoked with (err, result).
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * // file1.txt is a file that is 1000 bytes in size
     * // file2.txt is a file that is 2000 bytes in size
     * // file3.txt is a file that is 3000 bytes in size
     * // file4.txt does not exist
     *
     * const fileMap = {
     *     f1: 'file1.txt',
     *     f2: 'file2.txt',
     *     f3: 'file3.txt'
     * };
     *
     * const withMissingFileMap = {
     *     f1: 'file1.txt',
     *     f2: 'file2.txt',
     *     f3: 'file4.txt'
     * };
     *
     * // asynchronous function that returns the file size in bytes
     * function getFileSizeInBytes(file, key, callback) {
     *     fs.stat(file, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         callback(null, stat.size);
     *     });
     * }
     *
     * // Using callbacks
     * async.mapValues(fileMap, getFileSizeInBytes, function(err, result) {
     *     if (err) {
     *         console.log(err);
     *     } else {
     *         console.log(result);
     *         // result is now a map of file size in bytes for each file, e.g.
     *         // {
     *         //     f1: 1000,
     *         //     f2: 2000,
     *         //     f3: 3000
     *         // }
     *     }
     * });
     *
     * // Error handling
     * async.mapValues(withMissingFileMap, getFileSizeInBytes, function(err, result) {
     *     if (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     } else {
     *         console.log(result);
     *     }
     * });
     *
     * // Using Promises
     * async.mapValues(fileMap, getFileSizeInBytes)
     * .then( result => {
     *     console.log(result);
     *     // result is now a map of file size in bytes for each file, e.g.
     *     // {
     *     //     f1: 1000,
     *     //     f2: 2000,
     *     //     f3: 3000
     *     // }
     * }).catch (err => {
     *     console.log(err);
     * });
     *
     * // Error Handling
     * async.mapValues(withMissingFileMap, getFileSizeInBytes)
     * .then( result => {
     *     console.log(result);
     * }).catch (err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.mapValues(fileMap, getFileSizeInBytes);
     *         console.log(result);
     *         // result is now a map of file size in bytes for each file, e.g.
     *         // {
     *         //     f1: 1000,
     *         //     f2: 2000,
     *         //     f3: 3000
     *         // }
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // Error Handling
     * async () => {
     *     try {
     *         let result = await async.mapValues(withMissingFileMap, getFileSizeInBytes);
     *         console.log(result);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     }
     * }
     *
     */
    function mapValues(obj, iteratee, callback) {
        return mapValuesLimit$1(obj, Infinity, iteratee, callback)
    }

    /**
     * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
     *
     * @name mapValuesSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.mapValues]{@link module:Collections.mapValues}
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {AsyncFunction} iteratee - A function to apply to each value and key
     * in `coll`.
     * The iteratee should complete with the transformed value as its result.
     * Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. `result` is a new object consisting
     * of each key from `obj`, with each transformed value on the right-hand side.
     * Invoked with (err, result).
     * @returns {Promise} a promise, if no callback is passed
     */
    function mapValuesSeries(obj, iteratee, callback) {
        return mapValuesLimit$1(obj, 1, iteratee, callback)
    }

    /**
     * Caches the results of an async function. When creating a hash to store
     * function results against, the callback is omitted from the hash and an
     * optional hash function can be used.
     *
     * **Note: if the async function errs, the result will not be cached and
     * subsequent calls will call the wrapped function.**
     *
     * If no hash function is specified, the first argument is used as a hash key,
     * which may work reasonably if it is a string or a data type that converts to a
     * distinct string. Note that objects and arrays will not behave reasonably.
     * Neither will cases where the other arguments are significant. In such cases,
     * specify your own hash function.
     *
     * The cache of results is exposed as the `memo` property of the function
     * returned by `memoize`.
     *
     * @name memoize
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} fn - The async function to proxy and cache results from.
     * @param {Function} hasher - An optional function for generating a custom hash
     * for storing results. It has all the arguments applied to it apart from the
     * callback, and must be synchronous.
     * @returns {AsyncFunction} a memoized version of `fn`
     * @example
     *
     * var slow_fn = function(name, callback) {
     *     // do something
     *     callback(null, result);
     * };
     * var fn = async.memoize(slow_fn);
     *
     * // fn can now be used as if it were slow_fn
     * fn('some name', function() {
     *     // callback
     * });
     */
    function memoize(fn, hasher = v => v) {
        var memo = Object.create(null);
        var queues = Object.create(null);
        var _fn = wrapAsync(fn);
        var memoized = initialParams((args, callback) => {
            var key = hasher(...args);
            if (key in memo) {
                setImmediate$1(() => callback(null, ...memo[key]));
            } else if (key in queues) {
                queues[key].push(callback);
            } else {
                queues[key] = [callback];
                _fn(...args, (err, ...resultArgs) => {
                    // #1465 don't memoize if an error occurred
                    if (!err) {
                        memo[key] = resultArgs;
                    }
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i](err, ...resultArgs);
                    }
                });
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    }

    /* istanbul ignore file */

    /**
     * Calls `callback` on a later loop around the event loop. In Node.js this just
     * calls `process.nextTick`.  In the browser it will use `setImmediate` if
     * available, otherwise `setTimeout(callback, 0)`, which means other higher
     * priority events may precede the execution of `callback`.
     *
     * This is used internally for browser-compatibility purposes.
     *
     * @name nextTick
     * @static
     * @memberOf module:Utils
     * @method
     * @see [async.setImmediate]{@link module:Utils.setImmediate}
     * @category Util
     * @param {Function} callback - The function to call on a later loop around
     * the event loop. Invoked with (args...).
     * @param {...*} args... - any number of additional arguments to pass to the
     * callback on the next tick.
     * @example
     *
     * var call_order = [];
     * async.nextTick(function() {
     *     call_order.push('two');
     *     // call_order now equals ['one','two']
     * });
     * call_order.push('one');
     *
     * async.setImmediate(function (a, b, c) {
     *     // a, b, and c equal 1, 2, and 3
     * }, 1, 2, 3);
     */
    var _defer;

    if (hasNextTick) {
        _defer = process.nextTick;
    } else if (hasSetImmediate) {
        _defer = setImmediate;
    } else {
        _defer = fallback;
    }

    var nextTick = wrap(_defer);

    var _parallel = awaitify((eachfn, tasks, callback) => {
        var results = isArrayLike(tasks) ? [] : {};

        eachfn(tasks, (task, key, taskCb) => {
            wrapAsync(task)((err, ...result) => {
                if (result.length < 2) {
                    [result] = result;
                }
                results[key] = result;
                taskCb(err);
            });
        }, err => callback(err, results));
    }, 3);

    /**
     * Run the `tasks` collection of functions in parallel, without waiting until
     * the previous function has completed. If any of the functions pass an error to
     * its callback, the main `callback` is immediately called with the value of the
     * error. Once the `tasks` have completed, the results are passed to the final
     * `callback` as an array.
     *
     * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
     * parallel execution of code.  If your tasks do not use any timers or perform
     * any I/O, they will actually be executed in series.  Any synchronous setup
     * sections for each task will happen one after the other.  JavaScript remains
     * single-threaded.
     *
     * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
     * execution of other tasks when a task fails.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     * results from {@link async.parallel}.
     *
     * @name parallel
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
     * [async functions]{@link AsyncFunction} to run.
     * Each async function can complete with any number of optional `result` values.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     * @returns {Promise} a promise, if a callback is not passed
     *
     * @example
     *
     * //Using Callbacks
     * async.parallel([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ], function(err, results) {
     *     console.log(results);
     *     // results is equal to ['one','two'] even though
     *     // the second function had a shorter timeout.
     * });
     *
     * // an example using an object instead of an array
     * async.parallel({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     console.log(results);
     *     // results is equal to: { one: 1, two: 2 }
     * });
     *
     * //Using Promises
     * async.parallel([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ]).then(results => {
     *     console.log(results);
     *     // results is equal to ['one','two'] even though
     *     // the second function had a shorter timeout.
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // an example using an object instead of an array
     * async.parallel({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }).then(results => {
     *     console.log(results);
     *     // results is equal to: { one: 1, two: 2 }
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * //Using async/await
     * async () => {
     *     try {
     *         let results = await async.parallel([
     *             function(callback) {
     *                 setTimeout(function() {
     *                     callback(null, 'one');
     *                 }, 200);
     *             },
     *             function(callback) {
     *                 setTimeout(function() {
     *                     callback(null, 'two');
     *                 }, 100);
     *             }
     *         ]);
     *         console.log(results);
     *         // results is equal to ['one','two'] even though
     *         // the second function had a shorter timeout.
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // an example using an object instead of an array
     * async () => {
     *     try {
     *         let results = await async.parallel({
     *             one: function(callback) {
     *                 setTimeout(function() {
     *                     callback(null, 1);
     *                 }, 200);
     *             },
     *            two: function(callback) {
     *                 setTimeout(function() {
     *                     callback(null, 2);
     *                 }, 100);
     *            }
     *         });
     *         console.log(results);
     *         // results is equal to: { one: 1, two: 2 }
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function parallel(tasks, callback) {
        return _parallel(eachOf$1, tasks, callback);
    }

    /**
     * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name parallelLimit
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.parallel]{@link module:ControlFlow.parallel}
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
     * [async functions]{@link AsyncFunction} to run.
     * Each async function can complete with any number of optional `result` values.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     * @returns {Promise} a promise, if a callback is not passed
     */
    function parallelLimit(tasks, limit, callback) {
        return _parallel(eachOfLimit$2(limit), tasks, callback);
    }

    /**
     * A queue of tasks for the worker function to complete.
     * @typedef {Iterable} QueueObject
     * @memberOf module:ControlFlow
     * @property {Function} length - a function returning the number of items
     * waiting to be processed. Invoke with `queue.length()`.
     * @property {boolean} started - a boolean indicating whether or not any
     * items have been pushed and processed by the queue.
     * @property {Function} running - a function returning the number of items
     * currently being processed. Invoke with `queue.running()`.
     * @property {Function} workersList - a function returning the array of items
     * currently being processed. Invoke with `queue.workersList()`.
     * @property {Function} idle - a function returning false if there are items
     * waiting or being processed, or true if not. Invoke with `queue.idle()`.
     * @property {number} concurrency - an integer for determining how many `worker`
     * functions should be run in parallel. This property can be changed after a
     * `queue` is created to alter the concurrency on-the-fly.
     * @property {number} payload - an integer that specifies how many items are
     * passed to the worker function at a time. only applies if this is a
     * [cargo]{@link module:ControlFlow.cargo} object
     * @property {AsyncFunction} push - add a new task to the `queue`. Calls `callback`
     * once the `worker` has finished processing the task. Instead of a single task,
     * a `tasks` array can be submitted. The respective callback is used for every
     * task in the list. Invoke with `queue.push(task, [callback])`,
     * @property {AsyncFunction} unshift - add a new task to the front of the `queue`.
     * Invoke with `queue.unshift(task, [callback])`.
     * @property {AsyncFunction} pushAsync - the same as `q.push`, except this returns
     * a promise that rejects if an error occurs.
     * @property {AsyncFunction} unshiftAsync - the same as `q.unshift`, except this returns
     * a promise that rejects if an error occurs.
     * @property {Function} remove - remove items from the queue that match a test
     * function.  The test function will be passed an object with a `data` property,
     * and a `priority` property, if this is a
     * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
     * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
     * `function ({data, priority}) {}` and returns a Boolean.
     * @property {Function} saturated - a function that sets a callback that is
     * called when the number of running workers hits the `concurrency` limit, and
     * further tasks will be queued.  If the callback is omitted, `q.saturated()`
     * returns a promise for the next occurrence.
     * @property {Function} unsaturated - a function that sets a callback that is
     * called when the number of running workers is less than the `concurrency` &
     * `buffer` limits, and further tasks will not be queued. If the callback is
     * omitted, `q.unsaturated()` returns a promise for the next occurrence.
     * @property {number} buffer - A minimum threshold buffer in order to say that
     * the `queue` is `unsaturated`.
     * @property {Function} empty - a function that sets a callback that is called
     * when the last item from the `queue` is given to a `worker`. If the callback
     * is omitted, `q.empty()` returns a promise for the next occurrence.
     * @property {Function} drain - a function that sets a callback that is called
     * when the last item from the `queue` has returned from the `worker`. If the
     * callback is omitted, `q.drain()` returns a promise for the next occurrence.
     * @property {Function} error - a function that sets a callback that is called
     * when a task errors. Has the signature `function(error, task)`. If the
     * callback is omitted, `error()` returns a promise that rejects on the next
     * error.
     * @property {boolean} paused - a boolean for determining whether the queue is
     * in a paused state.
     * @property {Function} pause - a function that pauses the processing of tasks
     * until `resume()` is called. Invoke with `queue.pause()`.
     * @property {Function} resume - a function that resumes the processing of
     * queued tasks when the queue is paused. Invoke with `queue.resume()`.
     * @property {Function} kill - a function that removes the `drain` callback and
     * empties remaining tasks from the queue forcing it to go idle. No more tasks
     * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
     *
     * @example
     * const q = async.queue(worker, 2)
     * q.push(item1)
     * q.push(item2)
     * q.push(item3)
     * // queues are iterable, spread into an array to inspect
     * const items = [...q] // [item1, item2, item3]
     * // or use for of
     * for (let item of q) {
     *     console.log(item)
     * }
     *
     * q.drain(() => {
     *     console.log('all done')
     * })
     * // or
     * await q.drain()
     */

    /**
     * Creates a `queue` object with the specified `concurrency`. Tasks added to the
     * `queue` are processed in parallel (up to the `concurrency` limit). If all
     * `worker`s are in progress, the task is queued until one becomes available.
     * Once a `worker` completes a `task`, that `task`'s callback is called.
     *
     * @name queue
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {AsyncFunction} worker - An async function for processing a queued task.
     * If you want to handle errors from an individual task, pass a callback to
     * `q.push()`. Invoked with (task, callback).
     * @param {number} [concurrency=1] - An `integer` for determining how many
     * `worker` functions should be run in parallel.  If omitted, the concurrency
     * defaults to `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can be
     * attached as certain properties to listen for specific events during the
     * lifecycle of the queue.
     * @example
     *
     * // create a queue object with concurrency 2
     * var q = async.queue(function(task, callback) {
     *     console.log('hello ' + task.name);
     *     callback();
     * }, 2);
     *
     * // assign a callback
     * q.drain(function() {
     *     console.log('all items have been processed');
     * });
     * // or await the end
     * await q.drain()
     *
     * // assign an error callback
     * q.error(function(err, task) {
     *     console.error('task experienced an error');
     * });
     *
     * // add some items to the queue
     * q.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * // callback is optional
     * q.push({name: 'bar'});
     *
     * // add some items to the queue (batch-wise)
     * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
     *     console.log('finished processing item');
     * });
     *
     * // add some items to the front of the queue
     * q.unshift({name: 'bar'}, function (err) {
     *     console.log('finished processing bar');
     * });
     */
    function queue (worker, concurrency) {
        var _worker = wrapAsync(worker);
        return queue$1((items, cb) => {
            _worker(items[0], cb);
        }, concurrency, 1);
    }

    // Binary min-heap implementation used for priority queue.
    // Implementation is stable, i.e. push time is considered for equal priorities
    class Heap {
        constructor() {
            this.heap = [];
            this.pushCount = Number.MIN_SAFE_INTEGER;
        }

        get length() {
            return this.heap.length;
        }

        empty () {
            this.heap = [];
            return this;
        }

        percUp(index) {
            let p;

            while (index > 0 && smaller(this.heap[index], this.heap[p=parent(index)])) {
                let t = this.heap[index];
                this.heap[index] = this.heap[p];
                this.heap[p] = t;

                index = p;
            }
        }

        percDown(index) {
            let l;

            while ((l=leftChi(index)) < this.heap.length) {
                if (l+1 < this.heap.length && smaller(this.heap[l+1], this.heap[l])) {
                    l = l+1;
                }

                if (smaller(this.heap[index], this.heap[l])) {
                    break;
                }

                let t = this.heap[index];
                this.heap[index] = this.heap[l];
                this.heap[l] = t;

                index = l;
            }
        }

        push(node) {
            node.pushCount = ++this.pushCount;
            this.heap.push(node);
            this.percUp(this.heap.length-1);
        }

        unshift(node) {
            return this.heap.push(node);
        }

        shift() {
            let [top] = this.heap;

            this.heap[0] = this.heap[this.heap.length-1];
            this.heap.pop();
            this.percDown(0);

            return top;
        }

        toArray() {
            return [...this];
        }

        *[Symbol.iterator] () {
            for (let i = 0; i < this.heap.length; i++) {
                yield this.heap[i].data;
            }
        }

        remove (testFn) {
            let j = 0;
            for (let i = 0; i < this.heap.length; i++) {
                if (!testFn(this.heap[i])) {
                    this.heap[j] = this.heap[i];
                    j++;
                }
            }

            this.heap.splice(j);

            for (let i = parent(this.heap.length-1); i >= 0; i--) {
                this.percDown(i);
            }

            return this;
        }
    }

    function leftChi(i) {
        return (i<<1)+1;
    }

    function parent(i) {
        return ((i+1)>>1)-1;
    }

    function smaller(x, y) {
        if (x.priority !== y.priority) {
            return x.priority < y.priority;
        }
        else {
            return x.pushCount < y.pushCount;
        }
    }

    /**
     * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
     * completed in ascending priority order.
     *
     * @name priorityQueue
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.queue]{@link module:ControlFlow.queue}
     * @category Control Flow
     * @param {AsyncFunction} worker - An async function for processing a queued task.
     * If you want to handle errors from an individual task, pass a callback to
     * `q.push()`.
     * Invoked with (task, callback).
     * @param {number} concurrency - An `integer` for determining how many `worker`
     * functions should be run in parallel.  If omitted, the concurrency defaults to
     * `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are three
     * differences between `queue` and `priorityQueue` objects:
     * * `push(task, priority, [callback])` - `priority` should be a number. If an
     *   array of `tasks` is given, all tasks will be assigned the same priority.
     * * `pushAsync(task, priority, [callback])` - the same as `priorityQueue.push`,
     *   except this returns a promise that rejects if an error occurs.
     * * The `unshift` and `unshiftAsync` methods were removed.
     */
    function priorityQueue(worker, concurrency) {
        // Start with a normal queue
        var q = queue(worker, concurrency);

        var {
            push,
            pushAsync
        } = q;

        q._tasks = new Heap();
        q._createTaskItem = ({data, priority}, callback) => {
            return {
                data,
                priority,
                callback
            };
        };

        function createDataItems(tasks, priority) {
            if (!Array.isArray(tasks)) {
                return {data: tasks, priority};
            }
            return tasks.map(data => { return {data, priority}; });
        }

        // Override push to accept second parameter representing priority
        q.push = function(data, priority = 0, callback) {
            return push(createDataItems(data, priority), callback);
        };

        q.pushAsync = function(data, priority = 0, callback) {
            return pushAsync(createDataItems(data, priority), callback);
        };

        // Remove unshift functions
        delete q.unshift;
        delete q.unshiftAsync;

        return q;
    }

    /**
     * Runs the `tasks` array of functions in parallel, without waiting until the
     * previous function has completed. Once any of the `tasks` complete or pass an
     * error to its callback, the main `callback` is immediately called. It's
     * equivalent to `Promise.race()`.
     *
     * @name race
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
     * to run. Each function can complete with an optional `result` value.
     * @param {Function} callback - A callback to run once any of the functions have
     * completed. This function gets an error or result from the first function that
     * completed. Invoked with (err, result).
     * @returns {Promise} a promise, if a callback is omitted
     * @example
     *
     * async.race([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ],
     * // main callback
     * function(err, result) {
     *     // the result will be equal to 'two' as it finishes earlier
     * });
     */
    function race(tasks, callback) {
        callback = once(callback);
        if (!Array.isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
        if (!tasks.length) return callback();
        for (var i = 0, l = tasks.length; i < l; i++) {
            wrapAsync(tasks[i])(callback);
        }
    }

    var race$1 = awaitify(race, 2);

    /**
     * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
     *
     * @name reduceRight
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reduce]{@link module:Collections.reduce}
     * @alias foldr
     * @category Collection
     * @param {Array} array - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {AsyncFunction} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction.
     * The `iteratee` should complete with the next state of the reduction.
     * If the iteratee completes with an error, the reduction is stopped and the
     * main `callback` is immediately called with the error.
     * Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     * @returns {Promise} a promise, if no callback is passed
     */
    function reduceRight (array, memo, iteratee, callback) {
        var reversed = [...array].reverse();
        return reduce$1(reversed, memo, iteratee, callback);
    }

    /**
     * Wraps the async function in another function that always completes with a
     * result object, even when it errors.
     *
     * The result object has either the property `error` or `value`.
     *
     * @name reflect
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} fn - The async function you want to wrap
     * @returns {Function} - A function that always passes null to it's callback as
     * the error. The second argument to the callback will be an `object` with
     * either an `error` or a `value` property.
     * @example
     *
     * async.parallel([
     *     async.reflect(function(callback) {
     *         // do some stuff ...
     *         callback(null, 'one');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff but error ...
     *         callback('bad stuff happened');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff ...
     *         callback(null, 'two');
     *     })
     * ],
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = 'bad stuff happened'
     *     // results[2].value = 'two'
     * });
     */
    function reflect(fn) {
        var _fn = wrapAsync(fn);
        return initialParams(function reflectOn(args, reflectCallback) {
            args.push((error, ...cbArgs) => {
                let retVal = {};
                if (error) {
                    retVal.error = error;
                }
                if (cbArgs.length > 0){
                    var value = cbArgs;
                    if (cbArgs.length <= 1) {
                        [value] = cbArgs;
                    }
                    retVal.value = value;
                }
                reflectCallback(null, retVal);
            });

            return _fn.apply(this, args);
        });
    }

    /**
     * A helper function that wraps an array or an object of functions with `reflect`.
     *
     * @name reflectAll
     * @static
     * @memberOf module:Utils
     * @method
     * @see [async.reflect]{@link module:Utils.reflect}
     * @category Util
     * @param {Array|Object|Iterable} tasks - The collection of
     * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
     * @returns {Array} Returns an array of async functions, each wrapped in
     * `async.reflect`
     * @example
     *
     * let tasks = [
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         // do some more stuff but error ...
     *         callback(new Error('bad stuff happened'));
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ];
     *
     * async.parallel(async.reflectAll(tasks),
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = Error('bad stuff happened')
     *     // results[2].value = 'two'
     * });
     *
     * // an example using an object instead of an array
     * let tasks = {
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         callback('two');
     *     },
     *     three: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'three');
     *         }, 100);
     *     }
     * };
     *
     * async.parallel(async.reflectAll(tasks),
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results.one.value = 'one'
     *     // results.two.error = 'two'
     *     // results.three.value = 'three'
     * });
     */
    function reflectAll(tasks) {
        var results;
        if (Array.isArray(tasks)) {
            results = tasks.map(reflect);
        } else {
            results = {};
            Object.keys(tasks).forEach(key => {
                results[key] = reflect.call(this, tasks[key]);
            });
        }
        return results;
    }

    function reject$2(eachfn, arr, _iteratee, callback) {
        const iteratee = wrapAsync(_iteratee);
        return _filter(eachfn, arr, (value, cb) => {
            iteratee(value, (err, v) => {
                cb(err, !v);
            });
        }, callback);
    }

    /**
     * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
     *
     * @name reject
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.filter]{@link module:Collections.filter}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - An async truth test to apply to each item in
     * `coll`.
     * The should complete with a boolean value as its `result`.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     *
     * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir3/file6.txt'];
     *
     * // asynchronous function that checks if a file exists
     * function fileExists(file, callback) {
     *    fs.access(file, fs.constants.F_OK, (err) => {
     *        callback(null, !err);
     *    });
     * }
     *
     * // Using callbacks
     * async.reject(fileList, fileExists, function(err, results) {
     *    // [ 'dir3/file6.txt' ]
     *    // results now equals an array of the non-existing files
     * });
     *
     * // Using Promises
     * async.reject(fileList, fileExists)
     * .then( results => {
     *     console.log(results);
     *     // [ 'dir3/file6.txt' ]
     *     // results now equals an array of the non-existing files
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let results = await async.reject(fileList, fileExists);
     *         console.log(results);
     *         // [ 'dir3/file6.txt' ]
     *         // results now equals an array of the non-existing files
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function reject (coll, iteratee, callback) {
        return reject$2(eachOf$1, coll, iteratee, callback)
    }
    var reject$1 = awaitify(reject, 3);

    /**
     * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name rejectLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reject]{@link module:Collections.reject}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - An async truth test to apply to each item in
     * `coll`.
     * The should complete with a boolean value as its `result`.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     */
    function rejectLimit (coll, limit, iteratee, callback) {
        return reject$2(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var rejectLimit$1 = awaitify(rejectLimit, 4);

    /**
     * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
     *
     * @name rejectSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.reject]{@link module:Collections.reject}
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - An async truth test to apply to each item in
     * `coll`.
     * The should complete with a boolean value as its `result`.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback is passed
     */
    function rejectSeries (coll, iteratee, callback) {
        return reject$2(eachOfSeries$1, coll, iteratee, callback)
    }
    var rejectSeries$1 = awaitify(rejectSeries, 3);

    function constant(value) {
        return function () {
            return value;
        }
    }

    /**
     * Attempts to get a successful response from `task` no more than `times` times
     * before returning an error. If the task is successful, the `callback` will be
     * passed the result of the successful task. If all attempts fail, the callback
     * will be passed the error and result (if any) of the final attempt.
     *
     * @name retry
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @see [async.retryable]{@link module:ControlFlow.retryable}
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
     * object with `times` and `interval` or a number.
     * * `times` - The number of attempts to make before giving up.  The default
     *   is `5`.
     * * `interval` - The time to wait between retries, in milliseconds.  The
     *   default is `0`. The interval may also be specified as a function of the
     *   retry count (see example).
     * * `errorFilter` - An optional synchronous function that is invoked on
     *   erroneous result. If it returns `true` the retry attempts will continue;
     *   if the function returns `false` the retry flow is aborted with the current
     *   attempt's error and result being returned to the final callback.
     *   Invoked with (err).
     * * If `opts` is a number, the number specifies the number of times to retry,
     *   with the default interval of `0`.
     * @param {AsyncFunction} task - An async function to retry.
     * Invoked with (callback).
     * @param {Function} [callback] - An optional callback which is called when the
     * task has succeeded, or after the final failed attempt. It receives the `err`
     * and `result` arguments of the last attempt at completing the `task`. Invoked
     * with (err, results).
     * @returns {Promise} a promise if no callback provided
     *
     * @example
     *
     * // The `retry` function can be used as a stand-alone control flow by passing
     * // a callback, as shown below:
     *
     * // try calling apiMethod 3 times
     * async.retry(3, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 3 times, waiting 200 ms between each retry
     * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 10 times with exponential backoff
     * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
     * async.retry({
     *   times: 10,
     *   interval: function(retryCount) {
     *     return 50 * Math.pow(2, retryCount);
     *   }
     * }, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod the default 5 times no delay between each retry
     * async.retry(apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod only when error condition satisfies, all other
     * // errors will abort the retry control flow and return to final callback
     * async.retry({
     *   errorFilter: function(err) {
     *     return err.message === 'Temporary error'; // only retry on a specific error
     *   }
     * }, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // to retry individual methods that are not as reliable within other
     * // control flow functions, use the `retryable` wrapper:
     * async.auto({
     *     users: api.getUsers.bind(api),
     *     payments: async.retryable(3, api.getPayments.bind(api))
     * }, function(err, results) {
     *     // do something with the results
     * });
     *
     */
    const DEFAULT_TIMES = 5;
    const DEFAULT_INTERVAL = 0;

    function retry(opts, task, callback) {
        var options = {
            times: DEFAULT_TIMES,
            intervalFunc: constant(DEFAULT_INTERVAL)
        };

        if (arguments.length < 3 && typeof opts === 'function') {
            callback = task || promiseCallback();
            task = opts;
        } else {
            parseTimes(options, opts);
            callback = callback || promiseCallback();
        }

        if (typeof task !== 'function') {
            throw new Error("Invalid arguments for async.retry");
        }

        var _task = wrapAsync(task);

        var attempt = 1;
        function retryAttempt() {
            _task((err, ...args) => {
                if (err === false) return
                if (err && attempt++ < options.times &&
                    (typeof options.errorFilter != 'function' ||
                        options.errorFilter(err))) {
                    setTimeout(retryAttempt, options.intervalFunc(attempt - 1));
                } else {
                    callback(err, ...args);
                }
            });
        }

        retryAttempt();
        return callback[PROMISE_SYMBOL]
    }

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    /**
     * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
     * wraps a task and makes it retryable, rather than immediately calling it
     * with retries.
     *
     * @name retryable
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.retry]{@link module:ControlFlow.retry}
     * @category Control Flow
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
     * options, exactly the same as from `retry`, except for a `opts.arity` that
     * is the arity of the `task` function, defaulting to `task.length`
     * @param {AsyncFunction} task - the asynchronous function to wrap.
     * This function will be passed any arguments passed to the returned wrapper.
     * Invoked with (...args, callback).
     * @returns {AsyncFunction} The wrapped function, which when invoked, will
     * retry on an error, based on the parameters specified in `opts`.
     * This function will accept the same parameters as `task`.
     * @example
     *
     * async.auto({
     *     dep1: async.retryable(3, getFromFlakyService),
     *     process: ["dep1", async.retryable(3, function (results, cb) {
     *         maybeProcessData(results.dep1, cb);
     *     })]
     * }, callback);
     */
    function retryable (opts, task) {
        if (!task) {
            task = opts;
            opts = null;
        }
        let arity = (opts && opts.arity) || task.length;
        if (isAsync(task)) {
            arity += 1;
        }
        var _task = wrapAsync(task);
        return initialParams((args, callback) => {
            if (args.length < arity - 1 || callback == null) {
                args.push(callback);
                callback = promiseCallback();
            }
            function taskFn(cb) {
                _task(...args, cb);
            }

            if (opts) retry(opts, taskFn, callback);
            else retry(taskFn, callback);

            return callback[PROMISE_SYMBOL]
        });
    }

    /**
     * Run the functions in the `tasks` collection in series, each one running once
     * the previous function has completed. If any functions in the series pass an
     * error to its callback, no more functions are run, and `callback` is
     * immediately called with the value of the error. Otherwise, `callback`
     * receives an array of results when `tasks` have completed.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function, and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     *  results from {@link async.series}.
     *
     * **Note** that while many implementations preserve the order of object
     * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
     * explicitly states that
     *
     * > The mechanics and order of enumerating the properties is not specified.
     *
     * So if you rely on the order in which your series of functions are executed,
     * and want this to work on all platforms, consider using an array.
     *
     * @name series
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing
     * [async functions]{@link AsyncFunction} to run in series.
     * Each function can complete with any number of optional `result` values.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This function gets a results array (or object)
     * containing all the result arguments passed to the `task` callbacks. Invoked
     * with (err, result).
     * @return {Promise} a promise, if no callback is passed
     * @example
     *
     * //Using Callbacks
     * async.series([
     *     function(callback) {
     *         setTimeout(function() {
     *             // do some async task
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             // then do another async task
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ], function(err, results) {
     *     console.log(results);
     *     // results is equal to ['one','two']
     * });
     *
     * // an example using objects instead of arrays
     * async.series({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             // do some async task
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             // then do another async task
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     console.log(results);
     *     // results is equal to: { one: 1, two: 2 }
     * });
     *
     * //Using Promises
     * async.series([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ]).then(results => {
     *     console.log(results);
     *     // results is equal to ['one','two']
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // an example using an object instead of an array
     * async.series({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             // do some async task
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             // then do another async task
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }).then(results => {
     *     console.log(results);
     *     // results is equal to: { one: 1, two: 2 }
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * //Using async/await
     * async () => {
     *     try {
     *         let results = await async.series([
     *             function(callback) {
     *                 setTimeout(function() {
     *                     // do some async task
     *                     callback(null, 'one');
     *                 }, 200);
     *             },
     *             function(callback) {
     *                 setTimeout(function() {
     *                     // then do another async task
     *                     callback(null, 'two');
     *                 }, 100);
     *             }
     *         ]);
     *         console.log(results);
     *         // results is equal to ['one','two']
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * // an example using an object instead of an array
     * async () => {
     *     try {
     *         let results = await async.parallel({
     *             one: function(callback) {
     *                 setTimeout(function() {
     *                     // do some async task
     *                     callback(null, 1);
     *                 }, 200);
     *             },
     *            two: function(callback) {
     *                 setTimeout(function() {
     *                     // then do another async task
     *                     callback(null, 2);
     *                 }, 100);
     *            }
     *         });
     *         console.log(results);
     *         // results is equal to: { one: 1, two: 2 }
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function series(tasks, callback) {
        return _parallel(eachOfSeries$1, tasks, callback);
    }

    /**
     * Returns `true` if at least one element in the `coll` satisfies an async test.
     * If any iteratee call returns `true`, the main `callback` is immediately
     * called.
     *
     * @name some
     * @static
     * @memberOf module:Collections
     * @method
     * @alias any
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collections in parallel.
     * The iteratee should complete with a boolean `result` value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     * @example
     *
     * // dir1 is a directory that contains file1.txt, file2.txt
     * // dir2 is a directory that contains file3.txt, file4.txt
     * // dir3 is a directory that contains file5.txt
     * // dir4 does not exist
     *
     * // asynchronous function that checks if a file exists
     * function fileExists(file, callback) {
     *    fs.access(file, fs.constants.F_OK, (err) => {
     *        callback(null, !err);
     *    });
     * }
     *
     * // Using callbacks
     * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists,
     *    function(err, result) {
     *        console.log(result);
     *        // true
     *        // result is true since some file in the list exists
     *    }
     *);
     *
     * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists,
     *    function(err, result) {
     *        console.log(result);
     *        // false
     *        // result is false since none of the files exists
     *    }
     *);
     *
     * // Using Promises
     * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists)
     * .then( result => {
     *     console.log(result);
     *     // true
     *     // result is true since some file in the list exists
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists)
     * .then( result => {
     *     console.log(result);
     *     // false
     *     // result is false since none of the files exists
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists);
     *         console.log(result);
     *         // true
     *         // result is true since some file in the list exists
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     * async () => {
     *     try {
     *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists);
     *         console.log(result);
     *         // false
     *         // result is false since none of the files exists
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function some(coll, iteratee, callback) {
        return _createTester(Boolean, res => res)(eachOf$1, coll, iteratee, callback)
    }
    var some$1 = awaitify(some, 3);

    /**
     * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
     *
     * @name someLimit
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.some]{@link module:Collections.some}
     * @alias anyLimit
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collections in parallel.
     * The iteratee should complete with a boolean `result` value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     */
    function someLimit(coll, limit, iteratee, callback) {
        return _createTester(Boolean, res => res)(eachOfLimit$2(limit), coll, iteratee, callback)
    }
    var someLimit$1 = awaitify(someLimit, 4);

    /**
     * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
     *
     * @name someSeries
     * @static
     * @memberOf module:Collections
     * @method
     * @see [async.some]{@link module:Collections.some}
     * @alias anySeries
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async truth test to apply to each item
     * in the collections in series.
     * The iteratee should complete with a boolean `result` value.
     * Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     */
    function someSeries(coll, iteratee, callback) {
        return _createTester(Boolean, res => res)(eachOfSeries$1, coll, iteratee, callback)
    }
    var someSeries$1 = awaitify(someSeries, 3);

    /**
     * Sorts a list by the results of running each `coll` value through an async
     * `iteratee`.
     *
     * @name sortBy
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {AsyncFunction} iteratee - An async function to apply to each item in
     * `coll`.
     * The iteratee should complete with a value to use as the sort criteria as
     * its `result`.
     * Invoked with (item, callback).
     * @param {Function} callback - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is the items
     * from the original `coll` sorted by the values returned by the `iteratee`
     * calls. Invoked with (err, results).
     * @returns {Promise} a promise, if no callback passed
     * @example
     *
     * // bigfile.txt is a file that is 251100 bytes in size
     * // mediumfile.txt is a file that is 11000 bytes in size
     * // smallfile.txt is a file that is 121 bytes in size
     *
     * // asynchronous function that returns the file size in bytes
     * function getFileSizeInBytes(file, callback) {
     *     fs.stat(file, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         callback(null, stat.size);
     *     });
     * }
     *
     * // Using callbacks
     * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], getFileSizeInBytes,
     *     function(err, results) {
     *         if (err) {
     *             console.log(err);
     *         } else {
     *             console.log(results);
     *             // results is now the original array of files sorted by
     *             // file size (ascending by default), e.g.
     *             // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
     *         }
     *     }
     * );
     *
     * // By modifying the callback parameter the
     * // sorting order can be influenced:
     *
     * // ascending order
     * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], function(file, callback) {
     *     getFileSizeInBytes(file, function(getFileSizeErr, fileSize) {
     *         if (getFileSizeErr) return callback(getFileSizeErr);
     *         callback(null, fileSize);
     *     });
     * }, function(err, results) {
     *         if (err) {
     *             console.log(err);
     *         } else {
     *             console.log(results);
     *             // results is now the original array of files sorted by
     *             // file size (ascending by default), e.g.
     *             // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
     *         }
     *     }
     * );
     *
     * // descending order
     * async.sortBy(['bigfile.txt','mediumfile.txt','smallfile.txt'], function(file, callback) {
     *     getFileSizeInBytes(file, function(getFileSizeErr, fileSize) {
     *         if (getFileSizeErr) {
     *             return callback(getFileSizeErr);
     *         }
     *         callback(null, fileSize * -1);
     *     });
     * }, function(err, results) {
     *         if (err) {
     *             console.log(err);
     *         } else {
     *             console.log(results);
     *             // results is now the original array of files sorted by
     *             // file size (ascending by default), e.g.
     *             // [ 'bigfile.txt', 'mediumfile.txt', 'smallfile.txt']
     *         }
     *     }
     * );
     *
     * // Error handling
     * async.sortBy(['mediumfile.txt','smallfile.txt','missingfile.txt'], getFileSizeInBytes,
     *     function(err, results) {
     *         if (err) {
     *             console.log(err);
     *             // [ Error: ENOENT: no such file or directory ]
     *         } else {
     *             console.log(results);
     *         }
     *     }
     * );
     *
     * // Using Promises
     * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], getFileSizeInBytes)
     * .then( results => {
     *     console.log(results);
     *     // results is now the original array of files sorted by
     *     // file size (ascending by default), e.g.
     *     // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
     * }).catch( err => {
     *     console.log(err);
     * });
     *
     * // Error handling
     * async.sortBy(['mediumfile.txt','smallfile.txt','missingfile.txt'], getFileSizeInBytes)
     * .then( results => {
     *     console.log(results);
     * }).catch( err => {
     *     console.log(err);
     *     // [ Error: ENOENT: no such file or directory ]
     * });
     *
     * // Using async/await
     * (async () => {
     *     try {
     *         let results = await async.sortBy(['bigfile.txt','mediumfile.txt','smallfile.txt'], getFileSizeInBytes);
     *         console.log(results);
     *         // results is now the original array of files sorted by
     *         // file size (ascending by default), e.g.
     *         // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * })();
     *
     * // Error handling
     * async () => {
     *     try {
     *         let results = await async.sortBy(['missingfile.txt','mediumfile.txt','smallfile.txt'], getFileSizeInBytes);
     *         console.log(results);
     *     }
     *     catch (err) {
     *         console.log(err);
     *         // [ Error: ENOENT: no such file or directory ]
     *     }
     * }
     *
     */
    function sortBy (coll, iteratee, callback) {
        var _iteratee = wrapAsync(iteratee);
        return map$1(coll, (x, iterCb) => {
            _iteratee(x, (err, criteria) => {
                if (err) return iterCb(err);
                iterCb(err, {value: x, criteria});
            });
        }, (err, results) => {
            if (err) return callback(err);
            callback(null, results.sort(comparator).map(v => v.value));
        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    }
    var sortBy$1 = awaitify(sortBy, 3);

    /**
     * Sets a time limit on an asynchronous function. If the function does not call
     * its callback within the specified milliseconds, it will be called with a
     * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
     *
     * @name timeout
     * @static
     * @memberOf module:Utils
     * @method
     * @category Util
     * @param {AsyncFunction} asyncFn - The async function to limit in time.
     * @param {number} milliseconds - The specified time limit.
     * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
     * to timeout Error for more information..
     * @returns {AsyncFunction} Returns a wrapped function that can be used with any
     * of the control flow functions.
     * Invoke this function with the same parameters as you would `asyncFunc`.
     * @example
     *
     * function myFunction(foo, callback) {
     *     doAsyncTask(foo, function(err, data) {
     *         // handle errors
     *         if (err) return callback(err);
     *
     *         // do some stuff ...
     *
     *         // return processed data
     *         return callback(null, data);
     *     });
     * }
     *
     * var wrapped = async.timeout(myFunction, 1000);
     *
     * // call `wrapped` as you would `myFunction`
     * wrapped({ bar: 'bar' }, function(err, data) {
     *     // if `myFunction` takes < 1000 ms to execute, `err`
     *     // and `data` will have their expected values
     *
     *     // else `err` will be an Error with the code 'ETIMEDOUT'
     * });
     */
    function timeout(asyncFn, milliseconds, info) {
        var fn = wrapAsync(asyncFn);

        return initialParams((args, callback) => {
            var timedOut = false;
            var timer;

            function timeoutCallback() {
                var name = asyncFn.name || 'anonymous';
                var error  = new Error('Callback function "' + name + '" timed out.');
                error.code = 'ETIMEDOUT';
                if (info) {
                    error.info = info;
                }
                timedOut = true;
                callback(error);
            }

            args.push((...cbArgs) => {
                if (!timedOut) {
                    callback(...cbArgs);
                    clearTimeout(timer);
                }
            });

            // setup timer and call original function
            timer = setTimeout(timeoutCallback, milliseconds);
            fn(...args);
        });
    }

    function range(size) {
        var result = Array(size);
        while (size--) {
            result[size] = size;
        }
        return result;
    }

    /**
     * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name timesLimit
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.times]{@link module:ControlFlow.times}
     * @category Control Flow
     * @param {number} count - The number of times to run the function.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {AsyncFunction} iteratee - The async function to call `n` times.
     * Invoked with the iteration index and a callback: (n, next).
     * @param {Function} callback - see [async.map]{@link module:Collections.map}.
     * @returns {Promise} a promise, if no callback is provided
     */
    function timesLimit(count, limit, iteratee, callback) {
        var _iteratee = wrapAsync(iteratee);
        return mapLimit$1(range(count), limit, _iteratee, callback);
    }

    /**
     * Calls the `iteratee` function `n` times, and accumulates results in the same
     * manner you would use with [map]{@link module:Collections.map}.
     *
     * @name times
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.map]{@link module:Collections.map}
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {AsyncFunction} iteratee - The async function to call `n` times.
     * Invoked with the iteration index and a callback: (n, next).
     * @param {Function} callback - see {@link module:Collections.map}.
     * @returns {Promise} a promise, if no callback is provided
     * @example
     *
     * // Pretend this is some complicated async factory
     * var createUser = function(id, callback) {
     *     callback(null, {
     *         id: 'user' + id
     *     });
     * };
     *
     * // generate 5 users
     * async.times(5, function(n, next) {
     *     createUser(n, function(err, user) {
     *         next(err, user);
     *     });
     * }, function(err, users) {
     *     // we should now have 5 users
     * });
     */
    function times (n, iteratee, callback) {
        return timesLimit(n, Infinity, iteratee, callback)
    }

    /**
     * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
     *
     * @name timesSeries
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.times]{@link module:ControlFlow.times}
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {AsyncFunction} iteratee - The async function to call `n` times.
     * Invoked with the iteration index and a callback: (n, next).
     * @param {Function} callback - see {@link module:Collections.map}.
     * @returns {Promise} a promise, if no callback is provided
     */
    function timesSeries (n, iteratee, callback) {
        return timesLimit(n, 1, iteratee, callback)
    }

    /**
     * A relative of `reduce`.  Takes an Object or Array, and iterates over each
     * element in parallel, each step potentially mutating an `accumulator` value.
     * The type of the accumulator defaults to the type of collection passed in.
     *
     * @name transform
     * @static
     * @memberOf module:Collections
     * @method
     * @category Collection
     * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
     * @param {*} [accumulator] - The initial state of the transform.  If omitted,
     * it will default to an empty Object or Array, depending on the type of `coll`
     * @param {AsyncFunction} iteratee - A function applied to each item in the
     * collection that potentially modifies the accumulator.
     * Invoked with (accumulator, item, key, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the transformed accumulator.
     * Invoked with (err, result).
     * @returns {Promise} a promise, if no callback provided
     * @example
     *
     * // file1.txt is a file that is 1000 bytes in size
     * // file2.txt is a file that is 2000 bytes in size
     * // file3.txt is a file that is 3000 bytes in size
     *
     * // helper function that returns human-readable size format from bytes
     * function formatBytes(bytes, decimals = 2) {
     *   // implementation not included for brevity
     *   return humanReadbleFilesize;
     * }
     *
     * const fileList = ['file1.txt','file2.txt','file3.txt'];
     *
     * // asynchronous function that returns the file size, transformed to human-readable format
     * // e.g. 1024 bytes = 1KB, 1234 bytes = 1.21 KB, 1048576 bytes = 1MB, etc.
     * function transformFileSize(acc, value, key, callback) {
     *     fs.stat(value, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         acc[key] = formatBytes(stat.size);
     *         callback(null);
     *     });
     * }
     *
     * // Using callbacks
     * async.transform(fileList, transformFileSize, function(err, result) {
     *     if(err) {
     *         console.log(err);
     *     } else {
     *         console.log(result);
     *         // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
     *     }
     * });
     *
     * // Using Promises
     * async.transform(fileList, transformFileSize)
     * .then(result => {
     *     console.log(result);
     *     // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * (async () => {
     *     try {
     *         let result = await async.transform(fileList, transformFileSize);
     *         console.log(result);
     *         // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * })();
     *
     * @example
     *
     * // file1.txt is a file that is 1000 bytes in size
     * // file2.txt is a file that is 2000 bytes in size
     * // file3.txt is a file that is 3000 bytes in size
     *
     * // helper function that returns human-readable size format from bytes
     * function formatBytes(bytes, decimals = 2) {
     *   // implementation not included for brevity
     *   return humanReadbleFilesize;
     * }
     *
     * const fileMap = { f1: 'file1.txt', f2: 'file2.txt', f3: 'file3.txt' };
     *
     * // asynchronous function that returns the file size, transformed to human-readable format
     * // e.g. 1024 bytes = 1KB, 1234 bytes = 1.21 KB, 1048576 bytes = 1MB, etc.
     * function transformFileSize(acc, value, key, callback) {
     *     fs.stat(value, function(err, stat) {
     *         if (err) {
     *             return callback(err);
     *         }
     *         acc[key] = formatBytes(stat.size);
     *         callback(null);
     *     });
     * }
     *
     * // Using callbacks
     * async.transform(fileMap, transformFileSize, function(err, result) {
     *     if(err) {
     *         console.log(err);
     *     } else {
     *         console.log(result);
     *         // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
     *     }
     * });
     *
     * // Using Promises
     * async.transform(fileMap, transformFileSize)
     * .then(result => {
     *     console.log(result);
     *     // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
     * }).catch(err => {
     *     console.log(err);
     * });
     *
     * // Using async/await
     * async () => {
     *     try {
     *         let result = await async.transform(fileMap, transformFileSize);
     *         console.log(result);
     *         // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
     *     }
     *     catch (err) {
     *         console.log(err);
     *     }
     * }
     *
     */
    function transform (coll, accumulator, iteratee, callback) {
        if (arguments.length <= 3 && typeof accumulator === 'function') {
            callback = iteratee;
            iteratee = accumulator;
            accumulator = Array.isArray(coll) ? [] : {};
        }
        callback = once(callback || promiseCallback());
        var _iteratee = wrapAsync(iteratee);

        eachOf$1(coll, (v, k, cb) => {
            _iteratee(accumulator, v, k, cb);
        }, err => callback(err, accumulator));
        return callback[PROMISE_SYMBOL]
    }

    /**
     * It runs each task in series but stops whenever any of the functions were
     * successful. If one of the tasks were successful, the `callback` will be
     * passed the result of the successful task. If all tasks fail, the callback
     * will be passed the error and result (if any) of the final attempt.
     *
     * @name tryEach
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing functions to
     * run, each function is passed a `callback(err, result)` it must call on
     * completion with an error `err` (which can be `null`) and an optional `result`
     * value.
     * @param {Function} [callback] - An optional callback which is called when one
     * of the tasks has succeeded, or all have failed. It receives the `err` and
     * `result` arguments of the last attempt at completing the `task`. Invoked with
     * (err, results).
     * @returns {Promise} a promise, if no callback is passed
     * @example
     * async.tryEach([
     *     function getDataFromFirstWebsite(callback) {
     *         // Try getting the data from the first website
     *         callback(err, data);
     *     },
     *     function getDataFromSecondWebsite(callback) {
     *         // First website failed,
     *         // Try getting the data from the backup website
     *         callback(err, data);
     *     }
     * ],
     * // optional callback
     * function(err, results) {
     *     Now do something with the data.
     * });
     *
     */
    function tryEach(tasks, callback) {
        var error = null;
        var result;
        return eachSeries$1(tasks, (task, taskCb) => {
            wrapAsync(task)((err, ...args) => {
                if (err === false) return taskCb(err);

                if (args.length < 2) {
                    [result] = args;
                } else {
                    result = args;
                }
                error = err;
                taskCb(err ? null : {});
            });
        }, () => callback(error, result));
    }

    var tryEach$1 = awaitify(tryEach);

    /**
     * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
     * unmemoized form. Handy for testing.
     *
     * @name unmemoize
     * @static
     * @memberOf module:Utils
     * @method
     * @see [async.memoize]{@link module:Utils.memoize}
     * @category Util
     * @param {AsyncFunction} fn - the memoized function
     * @returns {AsyncFunction} a function that calls the original unmemoized function
     */
    function unmemoize(fn) {
        return (...args) => {
            return (fn.unmemoized || fn)(...args);
        };
    }

    /**
     * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs.
     *
     * @name whilst
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {AsyncFunction} test - asynchronous truth test to perform before each
     * execution of `iteratee`. Invoked with (callback).
     * @param {AsyncFunction} iteratee - An async function which is called each time
     * `test` passes. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `iteratee` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `iteratee`'s
     * callback. Invoked with (err, [results]);
     * @returns {Promise} a promise, if no callback is passed
     * @example
     *
     * var count = 0;
     * async.whilst(
     *     function test(cb) { cb(null, count < 5); },
     *     function iter(callback) {
     *         count++;
     *         setTimeout(function() {
     *             callback(null, count);
     *         }, 1000);
     *     },
     *     function (err, n) {
     *         // 5 seconds have passed, n = 5
     *     }
     * );
     */
    function whilst(test, iteratee, callback) {
        callback = onlyOnce(callback);
        var _fn = wrapAsync(iteratee);
        var _test = wrapAsync(test);
        var results = [];

        function next(err, ...rest) {
            if (err) return callback(err);
            results = rest;
            if (err === false) return;
            _test(check);
        }

        function check(err, truth) {
            if (err) return callback(err);
            if (err === false) return;
            if (!truth) return callback(null, ...results);
            _fn(next);
        }

        return _test(check);
    }
    var whilst$1 = awaitify(whilst, 3);

    /**
     * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs. `callback` will be passed an error and any
     * arguments passed to the final `iteratee`'s callback.
     *
     * The inverse of [whilst]{@link module:ControlFlow.whilst}.
     *
     * @name until
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @see [async.whilst]{@link module:ControlFlow.whilst}
     * @category Control Flow
     * @param {AsyncFunction} test - asynchronous truth test to perform before each
     * execution of `iteratee`. Invoked with (callback).
     * @param {AsyncFunction} iteratee - An async function which is called each time
     * `test` fails. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `iteratee` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `iteratee`'s
     * callback. Invoked with (err, [results]);
     * @returns {Promise} a promise, if a callback is not passed
     *
     * @example
     * const results = []
     * let finished = false
     * async.until(function test(cb) {
     *     cb(null, finished)
     * }, function iter(next) {
     *     fetchPage(url, (err, body) => {
     *         if (err) return next(err)
     *         results = results.concat(body.objects)
     *         finished = !!body.next
     *         next(err)
     *     })
     * }, function done (err) {
     *     // all pages have been fetched
     * })
     */
    function until(test, iteratee, callback) {
        const _test = wrapAsync(test);
        return whilst$1((cb) => _test((err, truth) => cb (err, !truth)), iteratee, callback);
    }

    /**
     * Runs the `tasks` array of functions in series, each passing their results to
     * the next in the array. However, if any of the `tasks` pass an error to their
     * own callback, the next function is not executed, and the main `callback` is
     * immediately called with the error.
     *
     * @name waterfall
     * @static
     * @memberOf module:ControlFlow
     * @method
     * @category Control Flow
     * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
     * to run.
     * Each function should complete with any number of `result` values.
     * The `result` values will be passed as arguments, in order, to the next task.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This will be passed the results of the last task's
     * callback. Invoked with (err, [results]).
     * @returns {Promise} a promise, if a callback is omitted
     * @example
     *
     * async.waterfall([
     *     function(callback) {
     *         callback(null, 'one', 'two');
     *     },
     *     function(arg1, arg2, callback) {
     *         // arg1 now equals 'one' and arg2 now equals 'two'
     *         callback(null, 'three');
     *     },
     *     function(arg1, callback) {
     *         // arg1 now equals 'three'
     *         callback(null, 'done');
     *     }
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     *
     * // Or, with named functions:
     * async.waterfall([
     *     myFirstFunction,
     *     mySecondFunction,
     *     myLastFunction,
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     * function myFirstFunction(callback) {
     *     callback(null, 'one', 'two');
     * }
     * function mySecondFunction(arg1, arg2, callback) {
     *     // arg1 now equals 'one' and arg2 now equals 'two'
     *     callback(null, 'three');
     * }
     * function myLastFunction(arg1, callback) {
     *     // arg1 now equals 'three'
     *     callback(null, 'done');
     * }
     */
    function waterfall (tasks, callback) {
        callback = once(callback);
        if (!Array.isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
        if (!tasks.length) return callback();
        var taskIndex = 0;

        function nextTask(args) {
            var task = wrapAsync(tasks[taskIndex++]);
            task(...args, onlyOnce(next));
        }

        function next(err, ...args) {
            if (err === false) return
            if (err || taskIndex === tasks.length) {
                return callback(err, ...args);
            }
            nextTask(args);
        }

        nextTask([]);
    }

    var waterfall$1 = awaitify(waterfall);

    /**
     * An "async function" in the context of Async is an asynchronous function with
     * a variable number of parameters, with the final parameter being a callback.
     * (`function (arg1, arg2, ..., callback) {}`)
     * The final callback is of the form `callback(err, results...)`, which must be
     * called once the function is completed.  The callback should be called with a
     * Error as its first argument to signal that an error occurred.
     * Otherwise, if no error occurred, it should be called with `null` as the first
     * argument, and any additional `result` arguments that may apply, to signal
     * successful completion.
     * The callback must be called exactly once, ideally on a later tick of the
     * JavaScript event loop.
     *
     * This type of function is also referred to as a "Node-style async function",
     * or a "continuation passing-style function" (CPS). Most of the methods of this
     * library are themselves CPS/Node-style async functions, or functions that
     * return CPS/Node-style async functions.
     *
     * Wherever we accept a Node-style async function, we also directly accept an
     * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
     * In this case, the `async` function will not be passed a final callback
     * argument, and any thrown error will be used as the `err` argument of the
     * implicit callback, and the return value will be used as the `result` value.
     * (i.e. a `rejected` of the returned Promise becomes the `err` callback
     * argument, and a `resolved` value becomes the `result`.)
     *
     * Note, due to JavaScript limitations, we can only detect native `async`
     * functions and not transpilied implementations.
     * Your environment must have `async`/`await` support for this to work.
     * (e.g. Node > v7.6, or a recent version of a modern browser).
     * If you are using `async` functions through a transpiler (e.g. Babel), you
     * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
     * because the `async function` will be compiled to an ordinary function that
     * returns a promise.
     *
     * @typedef {Function} AsyncFunction
     * @static
     */


    var index = {
        apply,
        applyEach,
        applyEachSeries,
        asyncify,
        auto,
        autoInject,
        cargo: cargo$1,
        cargoQueue: cargo,
        compose,
        concat: concat$1,
        concatLimit: concatLimit$1,
        concatSeries: concatSeries$1,
        constant: constant$1,
        detect: detect$1,
        detectLimit: detectLimit$1,
        detectSeries: detectSeries$1,
        dir,
        doUntil,
        doWhilst: doWhilst$1,
        each,
        eachLimit: eachLimit$1,
        eachOf: eachOf$1,
        eachOfLimit: eachOfLimit$1,
        eachOfSeries: eachOfSeries$1,
        eachSeries: eachSeries$1,
        ensureAsync,
        every: every$1,
        everyLimit: everyLimit$1,
        everySeries: everySeries$1,
        filter: filter$1,
        filterLimit: filterLimit$1,
        filterSeries: filterSeries$1,
        forever: forever$1,
        groupBy,
        groupByLimit: groupByLimit$1,
        groupBySeries,
        log,
        map: map$1,
        mapLimit: mapLimit$1,
        mapSeries: mapSeries$1,
        mapValues,
        mapValuesLimit: mapValuesLimit$1,
        mapValuesSeries,
        memoize,
        nextTick,
        parallel,
        parallelLimit,
        priorityQueue,
        queue,
        race: race$1,
        reduce: reduce$1,
        reduceRight,
        reflect,
        reflectAll,
        reject: reject$1,
        rejectLimit: rejectLimit$1,
        rejectSeries: rejectSeries$1,
        retry,
        retryable,
        seq,
        series,
        setImmediate: setImmediate$1,
        some: some$1,
        someLimit: someLimit$1,
        someSeries: someSeries$1,
        sortBy: sortBy$1,
        timeout,
        times,
        timesLimit,
        timesSeries,
        transform,
        tryEach: tryEach$1,
        unmemoize,
        until,
        waterfall: waterfall$1,
        whilst: whilst$1,

        // aliases
        all: every$1,
        allLimit: everyLimit$1,
        allSeries: everySeries$1,
        any: some$1,
        anyLimit: someLimit$1,
        anySeries: someSeries$1,
        find: detect$1,
        findLimit: detectLimit$1,
        findSeries: detectSeries$1,
        flatMap: concat$1,
        flatMapLimit: concatLimit$1,
        flatMapSeries: concatSeries$1,
        forEach: each,
        forEachSeries: eachSeries$1,
        forEachLimit: eachLimit$1,
        forEachOf: eachOf$1,
        forEachOfSeries: eachOfSeries$1,
        forEachOfLimit: eachOfLimit$1,
        inject: reduce$1,
        foldl: reduce$1,
        foldr: reduceRight,
        select: filter$1,
        selectLimit: filterLimit$1,
        selectSeries: filterSeries$1,
        wrapSync: asyncify,
        during: whilst$1,
        doDuring: doWhilst$1
    };

    exports.all = every$1;
    exports.allLimit = everyLimit$1;
    exports.allSeries = everySeries$1;
    exports.any = some$1;
    exports.anyLimit = someLimit$1;
    exports.anySeries = someSeries$1;
    exports.apply = apply;
    exports.applyEach = applyEach;
    exports.applyEachSeries = applyEachSeries;
    exports.asyncify = asyncify;
    exports.auto = auto;
    exports.autoInject = autoInject;
    exports.cargo = cargo$1;
    exports.cargoQueue = cargo;
    exports.compose = compose;
    exports.concat = concat$1;
    exports.concatLimit = concatLimit$1;
    exports.concatSeries = concatSeries$1;
    exports.constant = constant$1;
    exports.default = index;
    exports.detect = detect$1;
    exports.detectLimit = detectLimit$1;
    exports.detectSeries = detectSeries$1;
    exports.dir = dir;
    exports.doDuring = doWhilst$1;
    exports.doUntil = doUntil;
    exports.doWhilst = doWhilst$1;
    exports.during = whilst$1;
    exports.each = each;
    exports.eachLimit = eachLimit$1;
    exports.eachOf = eachOf$1;
    exports.eachOfLimit = eachOfLimit$1;
    exports.eachOfSeries = eachOfSeries$1;
    exports.eachSeries = eachSeries$1;
    exports.ensureAsync = ensureAsync;
    exports.every = every$1;
    exports.everyLimit = everyLimit$1;
    exports.everySeries = everySeries$1;
    exports.filter = filter$1;
    exports.filterLimit = filterLimit$1;
    exports.filterSeries = filterSeries$1;
    exports.find = detect$1;
    exports.findLimit = detectLimit$1;
    exports.findSeries = detectSeries$1;
    exports.flatMap = concat$1;
    exports.flatMapLimit = concatLimit$1;
    exports.flatMapSeries = concatSeries$1;
    exports.foldl = reduce$1;
    exports.foldr = reduceRight;
    exports.forEach = each;
    exports.forEachLimit = eachLimit$1;
    exports.forEachOf = eachOf$1;
    exports.forEachOfLimit = eachOfLimit$1;
    exports.forEachOfSeries = eachOfSeries$1;
    exports.forEachSeries = eachSeries$1;
    exports.forever = forever$1;
    exports.groupBy = groupBy;
    exports.groupByLimit = groupByLimit$1;
    exports.groupBySeries = groupBySeries;
    exports.inject = reduce$1;
    exports.log = log;
    exports.map = map$1;
    exports.mapLimit = mapLimit$1;
    exports.mapSeries = mapSeries$1;
    exports.mapValues = mapValues;
    exports.mapValuesLimit = mapValuesLimit$1;
    exports.mapValuesSeries = mapValuesSeries;
    exports.memoize = memoize;
    exports.nextTick = nextTick;
    exports.parallel = parallel;
    exports.parallelLimit = parallelLimit;
    exports.priorityQueue = priorityQueue;
    exports.queue = queue;
    exports.race = race$1;
    exports.reduce = reduce$1;
    exports.reduceRight = reduceRight;
    exports.reflect = reflect;
    exports.reflectAll = reflectAll;
    exports.reject = reject$1;
    exports.rejectLimit = rejectLimit$1;
    exports.rejectSeries = rejectSeries$1;
    exports.retry = retry;
    exports.retryable = retryable;
    exports.select = filter$1;
    exports.selectLimit = filterLimit$1;
    exports.selectSeries = filterSeries$1;
    exports.seq = seq;
    exports.series = series;
    exports.setImmediate = setImmediate$1;
    exports.some = some$1;
    exports.someLimit = someLimit$1;
    exports.someSeries = someSeries$1;
    exports.sortBy = sortBy$1;
    exports.timeout = timeout;
    exports.times = times;
    exports.timesLimit = timesLimit;
    exports.timesSeries = timesSeries;
    exports.transform = transform;
    exports.tryEach = tryEach$1;
    exports.unmemoize = unmemoize;
    exports.until = until;
    exports.waterfall = waterfall$1;
    exports.whilst = whilst$1;
    exports.wrapSync = asyncify;

    Object.defineProperty(exports, '__esModule', { value: true });

}));


/***/ }),

/***/ 3497:
/***/ ((module) => {

function isBuffer (value) {
  return Buffer.isBuffer(value) || value instanceof Uint8Array
}

function isEncoding (encoding) {
  return Buffer.isEncoding(encoding)
}

function alloc (size, fill, encoding) {
  return Buffer.alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  return Buffer.allocUnsafe(size)
}

function allocUnsafeSlow (size) {
  return Buffer.allocUnsafeSlow(size)
}

function byteLength (string, encoding) {
  return Buffer.byteLength(string, encoding)
}

function compare (a, b) {
  return Buffer.compare(a, b)
}

function concat (buffers, totalLength) {
  return Buffer.concat(buffers, totalLength)
}

function copy (source, target, targetStart, start, end) {
  return toBuffer(source).copy(target, targetStart, start, end)
}

function equals (a, b) {
  return toBuffer(a).equals(b)
}

function fill (buffer, value, offset, end, encoding) {
  return toBuffer(buffer).fill(value, offset, end, encoding)
}

function from (value, encodingOrOffset, length) {
  return Buffer.from(value, encodingOrOffset, length)
}

function includes (buffer, value, byteOffset, encoding) {
  return toBuffer(buffer).includes(value, byteOffset, encoding)
}

function indexOf (buffer, value, byfeOffset, encoding) {
  return toBuffer(buffer).indexOf(value, byfeOffset, encoding)
}

function lastIndexOf (buffer, value, byteOffset, encoding) {
  return toBuffer(buffer).lastIndexOf(value, byteOffset, encoding)
}

function swap16 (buffer) {
  return toBuffer(buffer).swap16()
}

function swap32 (buffer) {
  return toBuffer(buffer).swap32()
}

function swap64 (buffer) {
  return toBuffer(buffer).swap64()
}

function toBuffer (buffer) {
  if (Buffer.isBuffer(buffer)) return buffer
  return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

function toString (buffer, encoding, start, end) {
  return toBuffer(buffer).toString(encoding, start, end)
}

function write (buffer, string, offset, length, encoding) {
  return toBuffer(buffer).write(string, offset, length, encoding)
}

function writeDoubleLE (buffer, value, offset) {
  return toBuffer(buffer).writeDoubleLE(value, offset)
}

function writeFloatLE (buffer, value, offset) {
  return toBuffer(buffer).writeFloatLE(value, offset)
}

function writeUInt32LE (buffer, value, offset) {
  return toBuffer(buffer).writeUInt32LE(value, offset)
}

function writeInt32LE (buffer, value, offset) {
  return toBuffer(buffer).writeInt32LE(value, offset)
}

function readDoubleLE (buffer, offset) {
  return toBuffer(buffer).readDoubleLE(offset)
}

function readFloatLE (buffer, offset) {
  return toBuffer(buffer).readFloatLE(offset)
}

function readUInt32LE (buffer, offset) {
  return toBuffer(buffer).readUInt32LE(offset)
}

function readInt32LE (buffer, offset) {
  return toBuffer(buffer).readInt32LE(offset)
}

module.exports = {
  isBuffer,
  isEncoding,
  alloc,
  allocUnsafe,
  allocUnsafeSlow,
  byteLength,
  compare,
  concat,
  copy,
  equals,
  fill,
  from,
  includes,
  indexOf,
  lastIndexOf,
  swap16,
  swap32,
  swap64,
  toBuffer,
  toString,
  write,
  writeDoubleLE,
  writeFloatLE,
  writeUInt32LE,
  writeInt32LE,
  readDoubleLE,
  readFloatLE,
  readUInt32LE,
  readInt32LE
}


/***/ }),

/***/ 9417:
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ 4794:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Buffer = (__nccwpck_require__(4300).Buffer);

var CRC_TABLE = [
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
  0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4,
  0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07,
  0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
  0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856,
  0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
  0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4,
  0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
  0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
  0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a,
  0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599,
  0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
  0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190,
  0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f,
  0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e,
  0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
  0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed,
  0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
  0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3,
  0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
  0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a,
  0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5,
  0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010,
  0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
  0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17,
  0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6,
  0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
  0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
  0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344,
  0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
  0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a,
  0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
  0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1,
  0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c,
  0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef,
  0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
  0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe,
  0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31,
  0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c,
  0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
  0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b,
  0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
  0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1,
  0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
  0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
  0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7,
  0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66,
  0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
  0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605,
  0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8,
  0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b,
  0x2d02ef8d
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  var hasNewBufferAPI =
      typeof Buffer.alloc === "function" &&
      typeof Buffer.from === "function";

  if (typeof input === "number") {
    return hasNewBufferAPI ? Buffer.alloc(input) : new Buffer(input);
  }
  else if (typeof input === "string") {
    return hasNewBufferAPI ? Buffer.from(input) : new Buffer(input);
  }
  else {
    throw new Error("input must be buffer, number, or string, received " +
                    typeof input);
  }
}

function bufferizeInt(num) {
  var tmp = ensureBuffer(4);
  tmp.writeInt32BE(num, 0);
  return tmp;
}

function _crc32(buf, previous) {
  buf = ensureBuffer(buf);
  if (Buffer.isBuffer(previous)) {
    previous = previous.readUInt32BE(0);
  }
  var crc = ~~previous ^ -1;
  for (var n = 0; n < buf.length; n++) {
    crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

function crc32() {
  return bufferizeInt(_crc32.apply(null, arguments));
}
crc32.signed = function () {
  return _crc32.apply(null, arguments);
};
crc32.unsigned = function () {
  return _crc32.apply(null, arguments) >>> 0;
};

module.exports = crc32;


/***/ }),

/***/ 2240:
/***/ ((module) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var ArchiveEntry = module.exports = function() {};

ArchiveEntry.prototype.getName = function() {};

ArchiveEntry.prototype.getSize = function() {};

ArchiveEntry.prototype.getLastModifiedDate = function() {};

ArchiveEntry.prototype.isDirectory = function() {};

/***/ }),

/***/ 6728:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var inherits = (__nccwpck_require__(3837).inherits);
var Transform = (__nccwpck_require__(1642).Transform);

var ArchiveEntry = __nccwpck_require__(2240);
var util = __nccwpck_require__(5208);

var ArchiveOutputStream = module.exports = function(options) {
  if (!(this instanceof ArchiveOutputStream)) {
    return new ArchiveOutputStream(options);
  }

  Transform.call(this, options);

  this.offset = 0;
  this._archive = {
    finish: false,
    finished: false,
    processing: false
  };
};

inherits(ArchiveOutputStream, Transform);

ArchiveOutputStream.prototype._appendBuffer = function(zae, source, callback) {
  // scaffold only
};

ArchiveOutputStream.prototype._appendStream = function(zae, source, callback) {
  // scaffold only
};

ArchiveOutputStream.prototype._emitErrorCallback = function(err) {
  if (err) {
    this.emit('error', err);
  }
};

ArchiveOutputStream.prototype._finish = function(ae) {
  // scaffold only
};

ArchiveOutputStream.prototype._normalizeEntry = function(ae) {
  // scaffold only
};

ArchiveOutputStream.prototype._transform = function(chunk, encoding, callback) {
  callback(null, chunk);
};

ArchiveOutputStream.prototype.entry = function(ae, source, callback) {
  source = source || null;

  if (typeof callback !== 'function') {
    callback = this._emitErrorCallback.bind(this);
  }

  if (!(ae instanceof ArchiveEntry)) {
    callback(new Error('not a valid instance of ArchiveEntry'));
    return;
  }

  if (this._archive.finish || this._archive.finished) {
    callback(new Error('unacceptable entry after finish'));
    return;
  }

  if (this._archive.processing) {
    callback(new Error('already processing an entry'));
    return;
  }

  this._archive.processing = true;
  this._normalizeEntry(ae);
  this._entry = ae;

  source = util.normalizeInputSource(source);

  if (Buffer.isBuffer(source)) {
    this._appendBuffer(ae, source, callback);
  } else if (util.isStream(source)) {
    this._appendStream(ae, source, callback);
  } else {
    this._archive.processing = false;
    callback(new Error('input source must be valid Stream or Buffer instance'));
    return;
  }

  return this;
};

ArchiveOutputStream.prototype.finish = function() {
  if (this._archive.processing) {
    this._archive.finish = true;
    return;
  }

  this._finish();
};

ArchiveOutputStream.prototype.getBytesWritten = function() {
  return this.offset;
};

ArchiveOutputStream.prototype.write = function(chunk, cb) {
  if (chunk) {
    this.offset += chunk.length;
  }

  return Transform.prototype.write.call(this, chunk, cb);
};

/***/ }),

/***/ 1704:
/***/ ((module) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
module.exports = {
  WORD: 4,
  DWORD: 8,
  EMPTY: Buffer.alloc(0),

  SHORT: 2,
  SHORT_MASK: 0xffff,
  SHORT_SHIFT: 16,
  SHORT_ZERO: Buffer.from(Array(2)),
  LONG: 4,
  LONG_ZERO: Buffer.from(Array(4)),

  MIN_VERSION_INITIAL: 10,
  MIN_VERSION_DATA_DESCRIPTOR: 20,
  MIN_VERSION_ZIP64: 45,
  VERSION_MADEBY: 45,

  METHOD_STORED: 0,
  METHOD_DEFLATED: 8,

  PLATFORM_UNIX: 3,
  PLATFORM_FAT: 0,

  SIG_LFH: 0x04034b50,
  SIG_DD: 0x08074b50,
  SIG_CFH: 0x02014b50,
  SIG_EOCD: 0x06054b50,
  SIG_ZIP64_EOCD: 0x06064B50,
  SIG_ZIP64_EOCD_LOC: 0x07064B50,

  ZIP64_MAGIC_SHORT: 0xffff,
  ZIP64_MAGIC: 0xffffffff,
  ZIP64_EXTRA_ID: 0x0001,

  ZLIB_NO_COMPRESSION: 0,
  ZLIB_BEST_SPEED: 1,
  ZLIB_BEST_COMPRESSION: 9,
  ZLIB_DEFAULT_COMPRESSION: -1,

  MODE_MASK: 0xFFF,
  DEFAULT_FILE_MODE: 33188, // 010644 = -rw-r--r-- = S_IFREG | S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH
  DEFAULT_DIR_MODE: 16877,  // 040755 = drwxr-xr-x = S_IFDIR | S_IRWXU | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH

  EXT_FILE_ATTR_DIR: 1106051088,  // 010173200020 = drwxr-xr-x = (((S_IFDIR | 0755) << 16) | S_DOS_D)
  EXT_FILE_ATTR_FILE: 2175008800, // 020151000040 = -rw-r--r-- = (((S_IFREG | 0644) << 16) | S_DOS_A) >>> 0

  // Unix file types
  S_IFMT: 61440,   // 0170000 type of file mask
  S_IFIFO: 4096,   // 010000 named pipe (fifo)
  S_IFCHR: 8192,   // 020000 character special
  S_IFDIR: 16384,  // 040000 directory
  S_IFBLK: 24576,  // 060000 block special
  S_IFREG: 32768,  // 0100000 regular
  S_IFLNK: 40960,  // 0120000 symbolic link
  S_IFSOCK: 49152, // 0140000 socket

  // DOS file type flags
  S_DOS_A: 32, // 040 Archive
  S_DOS_D: 16, // 020 Directory
  S_DOS_V: 8,  // 010 Volume
  S_DOS_S: 4,  // 04 System
  S_DOS_H: 2,  // 02 Hidden
  S_DOS_R: 1   // 01 Read Only
};


/***/ }),

/***/ 3229:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var zipUtil = __nccwpck_require__(8682);

var DATA_DESCRIPTOR_FLAG = 1 << 3;
var ENCRYPTION_FLAG = 1 << 0;
var NUMBER_OF_SHANNON_FANO_TREES_FLAG = 1 << 2;
var SLIDING_DICTIONARY_SIZE_FLAG = 1 << 1;
var STRONG_ENCRYPTION_FLAG = 1 << 6;
var UFT8_NAMES_FLAG = 1 << 11;

var GeneralPurposeBit = module.exports = function() {
  if (!(this instanceof GeneralPurposeBit)) {
    return new GeneralPurposeBit();
  }

  this.descriptor = false;
  this.encryption = false;
  this.utf8 = false;
  this.numberOfShannonFanoTrees = 0;
  this.strongEncryption = false;
  this.slidingDictionarySize = 0;

  return this;
};

GeneralPurposeBit.prototype.encode = function() {
  return zipUtil.getShortBytes(
    (this.descriptor ? DATA_DESCRIPTOR_FLAG : 0) |
    (this.utf8 ? UFT8_NAMES_FLAG : 0) |
    (this.encryption ? ENCRYPTION_FLAG : 0) |
    (this.strongEncryption ? STRONG_ENCRYPTION_FLAG : 0)
  );
};

GeneralPurposeBit.prototype.parse = function(buf, offset) {
  var flag = zipUtil.getShortBytesValue(buf, offset);
  var gbp = new GeneralPurposeBit();

  gbp.useDataDescriptor((flag & DATA_DESCRIPTOR_FLAG) !== 0);
  gbp.useUTF8ForNames((flag & UFT8_NAMES_FLAG) !== 0);
  gbp.useStrongEncryption((flag & STRONG_ENCRYPTION_FLAG) !== 0);
  gbp.useEncryption((flag & ENCRYPTION_FLAG) !== 0);
  gbp.setSlidingDictionarySize((flag & SLIDING_DICTIONARY_SIZE_FLAG) !== 0 ? 8192 : 4096);
  gbp.setNumberOfShannonFanoTrees((flag & NUMBER_OF_SHANNON_FANO_TREES_FLAG) !== 0 ? 3 : 2);

  return gbp;
};

GeneralPurposeBit.prototype.setNumberOfShannonFanoTrees = function(n) {
  this.numberOfShannonFanoTrees = n;
};

GeneralPurposeBit.prototype.getNumberOfShannonFanoTrees = function() {
  return this.numberOfShannonFanoTrees;
};

GeneralPurposeBit.prototype.setSlidingDictionarySize = function(n) {
  this.slidingDictionarySize = n;
};

GeneralPurposeBit.prototype.getSlidingDictionarySize = function() {
  return this.slidingDictionarySize;
};

GeneralPurposeBit.prototype.useDataDescriptor = function(b) {
  this.descriptor = b;
};

GeneralPurposeBit.prototype.usesDataDescriptor = function() {
  return this.descriptor;
};

GeneralPurposeBit.prototype.useEncryption = function(b) {
  this.encryption = b;
};

GeneralPurposeBit.prototype.usesEncryption = function() {
  return this.encryption;
};

GeneralPurposeBit.prototype.useStrongEncryption = function(b) {
  this.strongEncryption = b;
};

GeneralPurposeBit.prototype.usesStrongEncryption = function() {
  return this.strongEncryption;
};

GeneralPurposeBit.prototype.useUTF8ForNames = function(b) {
  this.utf8 = b;
};

GeneralPurposeBit.prototype.usesUTF8ForNames = function() {
  return this.utf8;
};

/***/ }),

/***/ 713:
/***/ ((module) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
module.exports = {
    /**
     * Bits used for permissions (and sticky bit)
     */
    PERM_MASK: 4095, // 07777

    /**
     * Bits used to indicate the filesystem object type.
     */
    FILE_TYPE_FLAG: 61440, // 0170000

    /**
     * Indicates symbolic links.
     */
    LINK_FLAG: 40960, // 0120000

    /**
     * Indicates plain files.
     */
    FILE_FLAG: 32768, // 0100000

    /**
     * Indicates directories.
     */
    DIR_FLAG: 16384, // 040000

    // ----------------------------------------------------------
    // somewhat arbitrary choices that are quite common for shared
    // installations
    // -----------------------------------------------------------

    /**
     * Default permissions for symbolic links.
     */
    DEFAULT_LINK_PERM: 511, // 0777

    /**
     * Default permissions for directories.
     */
    DEFAULT_DIR_PERM: 493, // 0755

    /**
     * Default permissions for plain files.
     */
    DEFAULT_FILE_PERM: 420 // 0644
};

/***/ }),

/***/ 8682:
/***/ ((module) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var util = module.exports = {};

util.dateToDos = function(d, forceLocalTime) {
  forceLocalTime = forceLocalTime || false;

  var year = forceLocalTime ? d.getFullYear() : d.getUTCFullYear();

  if (year < 1980) {
    return 2162688; // 1980-1-1 00:00:00
  } else if (year >= 2044) {
    return 2141175677; // 2043-12-31 23:59:58
  }

  var val = {
    year: year,
    month: forceLocalTime ? d.getMonth() : d.getUTCMonth(),
    date: forceLocalTime ? d.getDate() : d.getUTCDate(),
    hours: forceLocalTime ? d.getHours() : d.getUTCHours(),
    minutes: forceLocalTime ? d.getMinutes() : d.getUTCMinutes(),
    seconds: forceLocalTime ? d.getSeconds() : d.getUTCSeconds()
  };

  return ((val.year - 1980) << 25) | ((val.month + 1) << 21) | (val.date << 16) |
    (val.hours << 11) | (val.minutes << 5) | (val.seconds / 2);
};

util.dosToDate = function(dos) {
  return new Date(((dos >> 25) & 0x7f) + 1980, ((dos >> 21) & 0x0f) - 1, (dos >> 16) & 0x1f, (dos >> 11) & 0x1f, (dos >> 5) & 0x3f, (dos & 0x1f) << 1);
};

util.fromDosTime = function(buf) {
  return util.dosToDate(buf.readUInt32LE(0));
};

util.getEightBytes = function(v) {
  var buf = Buffer.alloc(8);
  buf.writeUInt32LE(v % 0x0100000000, 0);
  buf.writeUInt32LE((v / 0x0100000000) | 0, 4);

  return buf;
};

util.getShortBytes = function(v) {
  var buf = Buffer.alloc(2);
  buf.writeUInt16LE((v & 0xFFFF) >>> 0, 0);

  return buf;
};

util.getShortBytesValue = function(buf, offset) {
  return buf.readUInt16LE(offset);
};

util.getLongBytes = function(v) {
  var buf = Buffer.alloc(4);
  buf.writeUInt32LE((v & 0xFFFFFFFF) >>> 0, 0);

  return buf;
};

util.getLongBytesValue = function(buf, offset) {
  return buf.readUInt32LE(offset);
};

util.toDosTime = function(d) {
  return util.getLongBytes(util.dateToDos(d));
};

/***/ }),

/***/ 3179:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var inherits = (__nccwpck_require__(3837).inherits);
var normalizePath = __nccwpck_require__(5388);

var ArchiveEntry = __nccwpck_require__(2240);
var GeneralPurposeBit = __nccwpck_require__(3229);
var UnixStat = __nccwpck_require__(713);

var constants = __nccwpck_require__(1704);
var zipUtil = __nccwpck_require__(8682);

var ZipArchiveEntry = module.exports = function(name) {
  if (!(this instanceof ZipArchiveEntry)) {
    return new ZipArchiveEntry(name);
  }

  ArchiveEntry.call(this);

  this.platform = constants.PLATFORM_FAT;
  this.method = -1;

  this.name = null;
  this.size = 0;
  this.csize = 0;
  this.gpb = new GeneralPurposeBit();
  this.crc = 0;
  this.time = -1;

  this.minver = constants.MIN_VERSION_INITIAL;
  this.mode = -1;
  this.extra = null;
  this.exattr = 0;
  this.inattr = 0;
  this.comment = null;

  if (name) {
    this.setName(name);
  }
};

inherits(ZipArchiveEntry, ArchiveEntry);

/**
 * Returns the extra fields related to the entry.
 *
 * @returns {Buffer}
 */
ZipArchiveEntry.prototype.getCentralDirectoryExtra = function() {
  return this.getExtra();
};

/**
 * Returns the comment set for the entry.
 *
 * @returns {string}
 */
ZipArchiveEntry.prototype.getComment = function() {
  return this.comment !== null ? this.comment : '';
};

/**
 * Returns the compressed size of the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getCompressedSize = function() {
  return this.csize;
};

/**
 * Returns the CRC32 digest for the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getCrc = function() {
  return this.crc;
};

/**
 * Returns the external file attributes for the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getExternalAttributes = function() {
  return this.exattr;
};

/**
 * Returns the extra fields related to the entry.
 *
 * @returns {Buffer}
 */
ZipArchiveEntry.prototype.getExtra = function() {
  return this.extra !== null ? this.extra : constants.EMPTY;
};

/**
 * Returns the general purpose bits related to the entry.
 *
 * @returns {GeneralPurposeBit}
 */
ZipArchiveEntry.prototype.getGeneralPurposeBit = function() {
  return this.gpb;
};

/**
 * Returns the internal file attributes for the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getInternalAttributes = function() {
  return this.inattr;
};

/**
 * Returns the last modified date of the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getLastModifiedDate = function() {
  return this.getTime();
};

/**
 * Returns the extra fields related to the entry.
 *
 * @returns {Buffer}
 */
ZipArchiveEntry.prototype.getLocalFileDataExtra = function() {
  return this.getExtra();
};

/**
 * Returns the compression method used on the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getMethod = function() {
  return this.method;
};

/**
 * Returns the filename of the entry.
 *
 * @returns {string}
 */
ZipArchiveEntry.prototype.getName = function() {
  return this.name;
};

/**
 * Returns the platform on which the entry was made.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getPlatform = function() {
  return this.platform;
};

/**
 * Returns the size of the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getSize = function() {
  return this.size;
};

/**
 * Returns a date object representing the last modified date of the entry.
 *
 * @returns {number|Date}
 */
ZipArchiveEntry.prototype.getTime = function() {
  return this.time !== -1 ? zipUtil.dosToDate(this.time) : -1;
};

/**
 * Returns the DOS timestamp for the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getTimeDos = function() {
  return this.time !== -1 ? this.time : 0;
};

/**
 * Returns the UNIX file permissions for the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getUnixMode = function() {
  return this.platform !== constants.PLATFORM_UNIX ? 0 : ((this.getExternalAttributes() >> constants.SHORT_SHIFT) & constants.SHORT_MASK);
};

/**
 * Returns the version of ZIP needed to extract the entry.
 *
 * @returns {number}
 */
ZipArchiveEntry.prototype.getVersionNeededToExtract = function() {
  return this.minver;
};

/**
 * Sets the comment of the entry.
 *
 * @param comment
 */
ZipArchiveEntry.prototype.setComment = function(comment) {
  if (Buffer.byteLength(comment) !== comment.length) {
    this.getGeneralPurposeBit().useUTF8ForNames(true);
  }

  this.comment = comment;
};

/**
 * Sets the compressed size of the entry.
 *
 * @param size
 */
ZipArchiveEntry.prototype.setCompressedSize = function(size) {
  if (size < 0) {
    throw new Error('invalid entry compressed size');
  }

  this.csize = size;
};

/**
 * Sets the checksum of the entry.
 *
 * @param crc
 */
ZipArchiveEntry.prototype.setCrc = function(crc) {
  if (crc < 0) {
    throw new Error('invalid entry crc32');
  }

  this.crc = crc;
};

/**
 * Sets the external file attributes of the entry.
 *
 * @param attr
 */
ZipArchiveEntry.prototype.setExternalAttributes = function(attr) {
  this.exattr = attr >>> 0;
};

/**
 * Sets the extra fields related to the entry.
 *
 * @param extra
 */
ZipArchiveEntry.prototype.setExtra = function(extra) {
  this.extra = extra;
};

/**
 * Sets the general purpose bits related to the entry.
 *
 * @param gpb
 */
ZipArchiveEntry.prototype.setGeneralPurposeBit = function(gpb) {
  if (!(gpb instanceof GeneralPurposeBit)) {
    throw new Error('invalid entry GeneralPurposeBit');
  }

  this.gpb = gpb;
};

/**
 * Sets the internal file attributes of the entry.
 *
 * @param attr
 */
ZipArchiveEntry.prototype.setInternalAttributes = function(attr) {
  this.inattr = attr;
};

/**
 * Sets the compression method of the entry.
 *
 * @param method
 */
ZipArchiveEntry.prototype.setMethod = function(method) {
  if (method < 0) {
    throw new Error('invalid entry compression method');
  }

  this.method = method;
};

/**
 * Sets the name of the entry.
 *
 * @param name
 * @param prependSlash
 */
ZipArchiveEntry.prototype.setName = function(name, prependSlash = false) {
  name = normalizePath(name, false)
    .replace(/^\w+:/, '')
    .replace(/^(\.\.\/|\/)+/, '');

  if (prependSlash) {
    name = `/${name}`;
  }

  if (Buffer.byteLength(name) !== name.length) {
    this.getGeneralPurposeBit().useUTF8ForNames(true);
  }

  this.name = name;
};

/**
 * Sets the platform on which the entry was made.
 *
 * @param platform
 */
ZipArchiveEntry.prototype.setPlatform = function(platform) {
  this.platform = platform;
};

/**
 * Sets the size of the entry.
 *
 * @param size
 */
ZipArchiveEntry.prototype.setSize = function(size) {
  if (size < 0) {
    throw new Error('invalid entry size');
  }

  this.size = size;
};

/**
 * Sets the time of the entry.
 *
 * @param time
 * @param forceLocalTime
 */
ZipArchiveEntry.prototype.setTime = function(time, forceLocalTime) {
  if (!(time instanceof Date)) {
    throw new Error('invalid entry time');
  }

  this.time = zipUtil.dateToDos(time, forceLocalTime);
};

/**
 * Sets the UNIX file permissions for the entry.
 *
 * @param mode
 */
ZipArchiveEntry.prototype.setUnixMode = function(mode) {
  mode |= this.isDirectory() ? constants.S_IFDIR : constants.S_IFREG;

  var extattr = 0;
  extattr |= (mode << constants.SHORT_SHIFT) | (this.isDirectory() ? constants.S_DOS_D : constants.S_DOS_A);

  this.setExternalAttributes(extattr);
  this.mode = mode & constants.MODE_MASK;
  this.platform = constants.PLATFORM_UNIX;
};

/**
 * Sets the version of ZIP needed to extract this entry.
 *
 * @param minver
 */
ZipArchiveEntry.prototype.setVersionNeededToExtract = function(minver) {
  this.minver = minver;
};

/**
 * Returns true if this entry represents a directory.
 *
 * @returns {boolean}
 */
ZipArchiveEntry.prototype.isDirectory = function() {
  return this.getName().slice(-1) === '/';
};

/**
 * Returns true if this entry represents a unix symlink,
 * in which case the entry's content contains the target path
 * for the symlink.
 *
 * @returns {boolean}
 */
ZipArchiveEntry.prototype.isUnixSymlink = function() {
  return (this.getUnixMode() & UnixStat.FILE_TYPE_FLAG) === UnixStat.LINK_FLAG;
};

/**
 * Returns true if this entry is using the ZIP64 extension of ZIP.
 *
 * @returns {boolean}
 */
ZipArchiveEntry.prototype.isZip64 = function() {
  return this.csize > constants.ZIP64_MAGIC || this.size > constants.ZIP64_MAGIC;
};


/***/ }),

/***/ 4432:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var inherits = (__nccwpck_require__(3837).inherits);
var crc32 = __nccwpck_require__(3201);
var {CRC32Stream} = __nccwpck_require__(5101);
var {DeflateCRC32Stream} = __nccwpck_require__(5101);

var ArchiveOutputStream = __nccwpck_require__(6728);
var ZipArchiveEntry = __nccwpck_require__(3179);
var GeneralPurposeBit = __nccwpck_require__(3229);

var constants = __nccwpck_require__(1704);
var util = __nccwpck_require__(5208);
var zipUtil = __nccwpck_require__(8682);

var ZipArchiveOutputStream = module.exports = function(options) {
  if (!(this instanceof ZipArchiveOutputStream)) {
    return new ZipArchiveOutputStream(options);
  }

  options = this.options = this._defaults(options);

  ArchiveOutputStream.call(this, options);

  this._entry = null;
  this._entries = [];
  this._archive = {
    centralLength: 0,
    centralOffset: 0,
    comment: '',
    finish: false,
    finished: false,
    processing: false,
    forceZip64: options.forceZip64,
    forceLocalTime: options.forceLocalTime
  };
};

inherits(ZipArchiveOutputStream, ArchiveOutputStream);

ZipArchiveOutputStream.prototype._afterAppend = function(ae) {
  this._entries.push(ae);

  if (ae.getGeneralPurposeBit().usesDataDescriptor()) {
    this._writeDataDescriptor(ae);
  }

  this._archive.processing = false;
  this._entry = null;

  if (this._archive.finish && !this._archive.finished) {
    this._finish();
  }
};

ZipArchiveOutputStream.prototype._appendBuffer = function(ae, source, callback) {
  if (source.length === 0) {
    ae.setMethod(constants.METHOD_STORED);
  }

  var method = ae.getMethod();

  if (method === constants.METHOD_STORED) {
    ae.setSize(source.length);
    ae.setCompressedSize(source.length);
    ae.setCrc(crc32.buf(source) >>> 0);
  }

  this._writeLocalFileHeader(ae);

  if (method === constants.METHOD_STORED) {
    this.write(source);
    this._afterAppend(ae);
    callback(null, ae);
    return;
  } else if (method === constants.METHOD_DEFLATED) {
    this._smartStream(ae, callback).end(source);
    return;
  } else {
    callback(new Error('compression method ' + method + ' not implemented'));
    return;
  }
};

ZipArchiveOutputStream.prototype._appendStream = function(ae, source, callback) {
  ae.getGeneralPurposeBit().useDataDescriptor(true);
  ae.setVersionNeededToExtract(constants.MIN_VERSION_DATA_DESCRIPTOR);

  this._writeLocalFileHeader(ae);

  var smart = this._smartStream(ae, callback);
  source.once('error', function(err) {
    smart.emit('error', err);
    smart.end();
  })
  source.pipe(smart);
};

ZipArchiveOutputStream.prototype._defaults = function(o) {
  if (typeof o !== 'object') {
    o = {};
  }

  if (typeof o.zlib !== 'object') {
    o.zlib = {};
  }

  if (typeof o.zlib.level !== 'number') {
    o.zlib.level = constants.ZLIB_BEST_SPEED;
  }

  o.forceZip64 = !!o.forceZip64;
  o.forceLocalTime = !!o.forceLocalTime;

  return o;
};

ZipArchiveOutputStream.prototype._finish = function() {
  this._archive.centralOffset = this.offset;

  this._entries.forEach(function(ae) {
    this._writeCentralFileHeader(ae);
  }.bind(this));

  this._archive.centralLength = this.offset - this._archive.centralOffset;

  if (this.isZip64()) {
    this._writeCentralDirectoryZip64();
  }

  this._writeCentralDirectoryEnd();

  this._archive.processing = false;
  this._archive.finish = true;
  this._archive.finished = true;
  this.end();
};

ZipArchiveOutputStream.prototype._normalizeEntry = function(ae) {
  if (ae.getMethod() === -1) {
    ae.setMethod(constants.METHOD_DEFLATED);
  }

  if (ae.getMethod() === constants.METHOD_DEFLATED) {
    ae.getGeneralPurposeBit().useDataDescriptor(true);
    ae.setVersionNeededToExtract(constants.MIN_VERSION_DATA_DESCRIPTOR);
  }

  if (ae.getTime() === -1) {
    ae.setTime(new Date(), this._archive.forceLocalTime);
  }

  ae._offsets = {
    file: 0,
    data: 0,
    contents: 0,
  };
};

ZipArchiveOutputStream.prototype._smartStream = function(ae, callback) {
  var deflate = ae.getMethod() === constants.METHOD_DEFLATED;
  var process = deflate ? new DeflateCRC32Stream(this.options.zlib) : new CRC32Stream();
  var error = null;

  function handleStuff() {
    var digest = process.digest().readUInt32BE(0);
    ae.setCrc(digest);
    ae.setSize(process.size());
    ae.setCompressedSize(process.size(true));
    this._afterAppend(ae);
    callback(error, ae);
  }

  process.once('end', handleStuff.bind(this));
  process.once('error', function(err) {
    error = err;
  });

  process.pipe(this, { end: false });

  return process;
};

ZipArchiveOutputStream.prototype._writeCentralDirectoryEnd = function() {
  var records = this._entries.length;
  var size = this._archive.centralLength;
  var offset = this._archive.centralOffset;

  if (this.isZip64()) {
    records = constants.ZIP64_MAGIC_SHORT;
    size = constants.ZIP64_MAGIC;
    offset = constants.ZIP64_MAGIC;
  }

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_EOCD));

  // disk numbers
  this.write(constants.SHORT_ZERO);
  this.write(constants.SHORT_ZERO);

  // number of entries
  this.write(zipUtil.getShortBytes(records));
  this.write(zipUtil.getShortBytes(records));

  // length and location of CD
  this.write(zipUtil.getLongBytes(size));
  this.write(zipUtil.getLongBytes(offset));

  // archive comment
  var comment = this.getComment();
  var commentLength = Buffer.byteLength(comment);
  this.write(zipUtil.getShortBytes(commentLength));
  this.write(comment);
};

ZipArchiveOutputStream.prototype._writeCentralDirectoryZip64 = function() {
  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_ZIP64_EOCD));

  // size of the ZIP64 EOCD record
  this.write(zipUtil.getEightBytes(44));

  // version made by
  this.write(zipUtil.getShortBytes(constants.MIN_VERSION_ZIP64));

  // version to extract
  this.write(zipUtil.getShortBytes(constants.MIN_VERSION_ZIP64));

  // disk numbers
  this.write(constants.LONG_ZERO);
  this.write(constants.LONG_ZERO);

  // number of entries
  this.write(zipUtil.getEightBytes(this._entries.length));
  this.write(zipUtil.getEightBytes(this._entries.length));

  // length and location of CD
  this.write(zipUtil.getEightBytes(this._archive.centralLength));
  this.write(zipUtil.getEightBytes(this._archive.centralOffset));

  // extensible data sector
  // not implemented at this time

  // end of central directory locator
  this.write(zipUtil.getLongBytes(constants.SIG_ZIP64_EOCD_LOC));

  // disk number holding the ZIP64 EOCD record
  this.write(constants.LONG_ZERO);

  // relative offset of the ZIP64 EOCD record
  this.write(zipUtil.getEightBytes(this._archive.centralOffset + this._archive.centralLength));

  // total number of disks
  this.write(zipUtil.getLongBytes(1));
};

ZipArchiveOutputStream.prototype._writeCentralFileHeader = function(ae) {
  var gpb = ae.getGeneralPurposeBit();
  var method = ae.getMethod();
  var offsets = ae._offsets;

  var size = ae.getSize();
  var compressedSize = ae.getCompressedSize();

  if (ae.isZip64() || offsets.file > constants.ZIP64_MAGIC) {
    size = constants.ZIP64_MAGIC;
    compressedSize = constants.ZIP64_MAGIC;

    ae.setVersionNeededToExtract(constants.MIN_VERSION_ZIP64);

    var extraBuf = Buffer.concat([
      zipUtil.getShortBytes(constants.ZIP64_EXTRA_ID),
      zipUtil.getShortBytes(24),
      zipUtil.getEightBytes(ae.getSize()),
      zipUtil.getEightBytes(ae.getCompressedSize()),
      zipUtil.getEightBytes(offsets.file)
    ], 28);

    ae.setExtra(extraBuf);
  }

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_CFH));

  // version made by
  this.write(zipUtil.getShortBytes((ae.getPlatform() << 8) | constants.VERSION_MADEBY));

  // version to extract and general bit flag
  this.write(zipUtil.getShortBytes(ae.getVersionNeededToExtract()));
  this.write(gpb.encode());

  // compression method
  this.write(zipUtil.getShortBytes(method));

  // datetime
  this.write(zipUtil.getLongBytes(ae.getTimeDos()));

  // crc32 checksum
  this.write(zipUtil.getLongBytes(ae.getCrc()));

  // sizes
  this.write(zipUtil.getLongBytes(compressedSize));
  this.write(zipUtil.getLongBytes(size));

  var name = ae.getName();
  var comment = ae.getComment();
  var extra = ae.getCentralDirectoryExtra();

  if (gpb.usesUTF8ForNames()) {
    name = Buffer.from(name);
    comment = Buffer.from(comment);
  }

  // name length
  this.write(zipUtil.getShortBytes(name.length));

  // extra length
  this.write(zipUtil.getShortBytes(extra.length));

  // comments length
  this.write(zipUtil.getShortBytes(comment.length));

  // disk number start
  this.write(constants.SHORT_ZERO);

  // internal attributes
  this.write(zipUtil.getShortBytes(ae.getInternalAttributes()));

  // external attributes
  this.write(zipUtil.getLongBytes(ae.getExternalAttributes()));

  // relative offset of LFH
  if (offsets.file > constants.ZIP64_MAGIC) {
    this.write(zipUtil.getLongBytes(constants.ZIP64_MAGIC));
  } else {
    this.write(zipUtil.getLongBytes(offsets.file));
  }

  // name
  this.write(name);

  // extra
  this.write(extra);

  // comment
  this.write(comment);
};

ZipArchiveOutputStream.prototype._writeDataDescriptor = function(ae) {
  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_DD));

  // crc32 checksum
  this.write(zipUtil.getLongBytes(ae.getCrc()));

  // sizes
  if (ae.isZip64()) {
    this.write(zipUtil.getEightBytes(ae.getCompressedSize()));
    this.write(zipUtil.getEightBytes(ae.getSize()));
  } else {
    this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
    this.write(zipUtil.getLongBytes(ae.getSize()));
  }
};

ZipArchiveOutputStream.prototype._writeLocalFileHeader = function(ae) {
  var gpb = ae.getGeneralPurposeBit();
  var method = ae.getMethod();
  var name = ae.getName();
  var extra = ae.getLocalFileDataExtra();

  if (ae.isZip64()) {
    gpb.useDataDescriptor(true);
    ae.setVersionNeededToExtract(constants.MIN_VERSION_ZIP64);
  }

  if (gpb.usesUTF8ForNames()) {
    name = Buffer.from(name);
  }

  ae._offsets.file = this.offset;

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_LFH));

  // version to extract and general bit flag
  this.write(zipUtil.getShortBytes(ae.getVersionNeededToExtract()));
  this.write(gpb.encode());

  // compression method
  this.write(zipUtil.getShortBytes(method));

  // datetime
  this.write(zipUtil.getLongBytes(ae.getTimeDos()));

  ae._offsets.data = this.offset;

  // crc32 checksum and sizes
  if (gpb.usesDataDescriptor()) {
    this.write(constants.LONG_ZERO);
    this.write(constants.LONG_ZERO);
    this.write(constants.LONG_ZERO);
  } else {
    this.write(zipUtil.getLongBytes(ae.getCrc()));
    this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
    this.write(zipUtil.getLongBytes(ae.getSize()));
  }

  // name length
  this.write(zipUtil.getShortBytes(name.length));

  // extra length
  this.write(zipUtil.getShortBytes(extra.length));

  // name
  this.write(name);

  // extra
  this.write(extra);

  ae._offsets.contents = this.offset;
};

ZipArchiveOutputStream.prototype.getComment = function(comment) {
  return this._archive.comment !== null ? this._archive.comment : '';
};

ZipArchiveOutputStream.prototype.isZip64 = function() {
  return this._archive.forceZip64 || this._entries.length > constants.ZIP64_MAGIC_SHORT || this._archive.centralLength > constants.ZIP64_MAGIC || this._archive.centralOffset > constants.ZIP64_MAGIC;
};

ZipArchiveOutputStream.prototype.setComment = function(comment) {
  this._archive.comment = comment;
};


/***/ }),

/***/ 5445:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
module.exports = {
  ArchiveEntry: __nccwpck_require__(2240),
  ZipArchiveEntry: __nccwpck_require__(3179),
  ArchiveOutputStream: __nccwpck_require__(6728),
  ZipArchiveOutputStream: __nccwpck_require__(4432)
};

/***/ }),

/***/ 5208:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var Stream = (__nccwpck_require__(2781).Stream);
var PassThrough = (__nccwpck_require__(1642).PassThrough);

var util = module.exports = {};

util.isStream = function(source) {
  return source instanceof Stream;
};

util.normalizeInputSource = function(source) {
  if (source === null) {
    return Buffer.alloc(0);
  } else if (typeof source === 'string') {
    return Buffer.from(source);
  } else if (util.isStream(source) && !source._readableState) {
    var normalized = new PassThrough();
    source.pipe(normalized);

    return normalized;
  }

  return source;
};

/***/ }),

/***/ 5898:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __nccwpck_require__(4300).Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


/***/ }),

/***/ 3201:
/***/ ((__unused_webpack_module, exports) => {

/*! crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*exported CRC32 */
var CRC32;
(function (factory) {
	/*jshint ignore:start */
	/*eslint-disable */
	if(typeof DO_NOT_EXPORT_CRC === 'undefined') {
		if(true) {
			factory(exports);
		} else {}
	} else {
		factory(CRC32 = {});
	}
	/*eslint-enable */
	/*jshint ignore:end */
}(function(CRC32) {
CRC32.version = '1.2.2';
/*global Int32Array */
function signed_crc_table() {
	var c = 0, table = new Array(256);

	for(var n =0; n != 256; ++n){
		c = n;
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		table[n] = c;
	}

	return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
}

var T0 = signed_crc_table();
function slice_by_16_tables(T) {
	var c = 0, v = 0, n = 0, table = typeof Int32Array !== 'undefined' ? new Int32Array(4096) : new Array(4096) ;

	for(n = 0; n != 256; ++n) table[n] = T[n];
	for(n = 0; n != 256; ++n) {
		v = T[n];
		for(c = 256 + n; c < 4096; c += 256) v = table[c] = (v >>> 8) ^ T[v & 0xFF];
	}
	var out = [];
	for(n = 1; n != 16; ++n) out[n - 1] = typeof Int32Array !== 'undefined' ? table.subarray(n * 256, n * 256 + 256) : table.slice(n * 256, n * 256 + 256);
	return out;
}
var TT = slice_by_16_tables(T0);
var T1 = TT[0],  T2 = TT[1],  T3 = TT[2],  T4 = TT[3],  T5 = TT[4];
var T6 = TT[5],  T7 = TT[6],  T8 = TT[7],  T9 = TT[8],  Ta = TT[9];
var Tb = TT[10], Tc = TT[11], Td = TT[12], Te = TT[13], Tf = TT[14];
function crc32_bstr(bstr, seed) {
	var C = seed ^ -1;
	for(var i = 0, L = bstr.length; i < L;) C = (C>>>8) ^ T0[(C^bstr.charCodeAt(i++))&0xFF];
	return ~C;
}

function crc32_buf(B, seed) {
	var C = seed ^ -1, L = B.length - 15, i = 0;
	for(; i < L;) C =
		Tf[B[i++] ^ (C & 255)] ^
		Te[B[i++] ^ ((C >> 8) & 255)] ^
		Td[B[i++] ^ ((C >> 16) & 255)] ^
		Tc[B[i++] ^ (C >>> 24)] ^
		Tb[B[i++]] ^ Ta[B[i++]] ^ T9[B[i++]] ^ T8[B[i++]] ^
		T7[B[i++]] ^ T6[B[i++]] ^ T5[B[i++]] ^ T4[B[i++]] ^
		T3[B[i++]] ^ T2[B[i++]] ^ T1[B[i++]] ^ T0[B[i++]];
	L += 15;
	while(i < L) C = (C>>>8) ^ T0[(C^B[i++])&0xFF];
	return ~C;
}

function crc32_str(str, seed) {
	var C = seed ^ -1;
	for(var i = 0, L = str.length, c = 0, d = 0; i < L;) {
		c = str.charCodeAt(i++);
		if(c < 0x80) {
			C = (C>>>8) ^ T0[(C^c)&0xFF];
		} else if(c < 0x800) {
			C = (C>>>8) ^ T0[(C ^ (192|((c>>6)&31)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|(c&63)))&0xFF];
		} else if(c >= 0xD800 && c < 0xE000) {
			c = (c&1023)+64; d = str.charCodeAt(i++)&1023;
			C = (C>>>8) ^ T0[(C ^ (240|((c>>8)&7)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|((c>>2)&63)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|((d>>6)&15)|((c&3)<<4)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|(d&63)))&0xFF];
		} else {
			C = (C>>>8) ^ T0[(C ^ (224|((c>>12)&15)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|((c>>6)&63)))&0xFF];
			C = (C>>>8) ^ T0[(C ^ (128|(c&63)))&0xFF];
		}
	}
	return ~C;
}
CRC32.table = T0;
// $FlowIgnore
CRC32.bstr = crc32_bstr;
// $FlowIgnore
CRC32.buf = crc32_buf;
// $FlowIgnore
CRC32.str = crc32_str;
}));


/***/ }),

/***/ 4521:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/**
 * node-crc32-stream
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-crc32-stream/blob/master/LICENSE-MIT
 */

 

const {Transform} = __nccwpck_require__(1642);

const crc32 = __nccwpck_require__(3201);

class CRC32Stream extends Transform {
  constructor(options) {
    super(options);
    this.checksum = Buffer.allocUnsafe(4);
    this.checksum.writeInt32BE(0, 0);

    this.rawSize = 0;
  }

  _transform(chunk, encoding, callback) {
    if (chunk) {
      this.checksum = crc32.buf(chunk, this.checksum) >>> 0;
      this.rawSize += chunk.length;
    }

    callback(null, chunk);
  }

  digest(encoding) {
    const checksum = Buffer.allocUnsafe(4);
    checksum.writeUInt32BE(this.checksum >>> 0, 0);
    return encoding ? checksum.toString(encoding) : checksum;
  }

  hex() {
    return this.digest('hex').toUpperCase();
  }

  size() {
    return this.rawSize;
  }
}

module.exports = CRC32Stream;


/***/ }),

/***/ 2563:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/**
 * node-crc32-stream
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-crc32-stream/blob/master/LICENSE-MIT
 */



const {DeflateRaw} = __nccwpck_require__(9796);

const crc32 = __nccwpck_require__(3201);

class DeflateCRC32Stream extends DeflateRaw {
  constructor(options) {
    super(options);

    this.checksum = Buffer.allocUnsafe(4);
    this.checksum.writeInt32BE(0, 0);

    this.rawSize = 0;
    this.compressedSize = 0;
  }

  push(chunk, encoding) {
    if (chunk) {
      this.compressedSize += chunk.length;
    }

    return super.push(chunk, encoding);
  }

  _transform(chunk, encoding, callback) {
    if (chunk) {
      this.checksum = crc32.buf(chunk, this.checksum) >>> 0;
      this.rawSize += chunk.length;
    }

    super._transform(chunk, encoding, callback)
  }

  digest(encoding) {
    const checksum = Buffer.allocUnsafe(4);
    checksum.writeUInt32BE(this.checksum >>> 0, 0);
    return encoding ? checksum.toString(encoding) : checksum;
  }

  hex() {
    return this.digest('hex').toUpperCase();
  }

  size(compressed = false) {
    if (compressed) {
      return this.compressedSize;
    } else {
      return this.rawSize;
    }
  }
}

module.exports = DeflateCRC32Stream;


/***/ }),

/***/ 5101:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/**
 * node-crc32-stream
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-crc32-stream/blob/master/LICENSE-MIT
 */



module.exports = {
  CRC32Stream: __nccwpck_require__(4521),
  DeflateCRC32Stream: __nccwpck_require__(2563)
}


/***/ }),

/***/ 7030:
/***/ ((module) => {

module.exports = class FixedFIFO {
  constructor (hwm) {
    if (!(hwm > 0) || ((hwm - 1) & hwm) !== 0) throw new Error('Max size for a FixedFIFO should be a power of two')
    this.buffer = new Array(hwm)
    this.mask = hwm - 1
    this.top = 0
    this.btm = 0
    this.next = null
  }

  clear () {
    this.top = this.btm = 0
    this.next = null
    this.buffer.fill(undefined)
  }

  push (data) {
    if (this.buffer[this.top] !== undefined) return false
    this.buffer[this.top] = data
    this.top = (this.top + 1) & this.mask
    return true
  }

  shift () {
    const last = this.buffer[this.btm]
    if (last === undefined) return undefined
    this.buffer[this.btm] = undefined
    this.btm = (this.btm + 1) & this.mask
    return last
  }

  peek () {
    return this.buffer[this.btm]
  }

  isEmpty () {
    return this.buffer[this.btm] === undefined
  }
}


/***/ }),

/***/ 2958:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const FixedFIFO = __nccwpck_require__(7030)

module.exports = class FastFIFO {
  constructor (hwm) {
    this.hwm = hwm || 16
    this.head = new FixedFIFO(this.hwm)
    this.tail = this.head
    this.length = 0
  }

  clear () {
    this.head = this.tail
    this.head.clear()
    this.length = 0
  }

  push (val) {
    this.length++
    if (!this.head.push(val)) {
      const prev = this.head
      this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length)
      this.head.push(val)
    }
  }

  shift () {
    if (this.length !== 0) this.length--
    const val = this.tail.shift()
    if (val === undefined && this.tail.next) {
      const next = this.tail.next
      this.tail.next = null
      this.tail = next
      return this.tail.shift()
    }

    return val
  }

  peek () {
    const val = this.tail.peek()
    if (val === undefined && this.tail.next) return this.tail.next.peek()
    return val
  }

  isEmpty () {
    return this.length === 0
  }
}


/***/ }),

/***/ 6863:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = __nccwpck_require__(7147)
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = __nccwpck_require__(1734)

function newError (er) {
  return er && er.syscall === 'realpath' && (
    er.code === 'ELOOP' ||
    er.code === 'ENOMEM' ||
    er.code === 'ENAMETOOLONG'
  )
}

function realpath (p, cache, cb) {
  if (ok) {
    return origRealpath(p, cache, cb)
  }

  if (typeof cache === 'function') {
    cb = cache
    cache = null
  }
  origRealpath(p, cache, function (er, result) {
    if (newError(er)) {
      old.realpath(p, cache, cb)
    } else {
      cb(er, result)
    }
  })
}

function realpathSync (p, cache) {
  if (ok) {
    return origRealpathSync(p, cache)
  }

  try {
    return origRealpathSync(p, cache)
  } catch (er) {
    if (newError(er)) {
      return old.realpathSync(p, cache)
    } else {
      throw er
    }
  }
}

function monkeypatch () {
  fs.realpath = realpath
  fs.realpathSync = realpathSync
}

function unmonkeypatch () {
  fs.realpath = origRealpath
  fs.realpathSync = origRealpathSync
}


/***/ }),

/***/ 1734:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var pathModule = __nccwpck_require__(1017);
var isWindows = process.platform === 'win32';
var fs = __nccwpck_require__(7147);

// JavaScript implementation of realpath, ported from node pre-v6

var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (DEBUG) {
    var backtrace = new Error;
    callback = debugCallback;
  } else
    callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation)
        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
        var msg = 'fs: missing callback ' + (err.stack || err.message);
        if (process.traceDeprecation)
          console.trace(msg);
        else
          console.error(msg);
      }
    }
  }
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

var normalize = pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (isWindows) {
  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (isWindows) {
  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var splitRootRe = /^[\/]*/;
}

exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        fs.statSync(base);
        linkTarget = fs.readlinkSync(base);
      }
      resolvedLink = pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};


exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstat(base, function(err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    fs.stat(base, function(err) {
      if (err) return cb(err);

      fs.readlink(base, function(err, target) {
        if (!isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};


/***/ }),

/***/ 7356:
/***/ ((module) => {

"use strict";


module.exports = clone

var getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__
}

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) }
  else
    var copy = Object.create(null)

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
  })

  return copy
}


/***/ }),

/***/ 7758:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var fs = __nccwpck_require__(7147)
var polyfills = __nccwpck_require__(263)
var legacy = __nccwpck_require__(3086)
var clone = __nccwpck_require__(7356)

var util = __nccwpck_require__(3837)

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue
var previousSymbol

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue')
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous')
} else {
  gracefulQueue = '___graceful-fs.queue'
  previousSymbol = '___graceful-fs.previous'
}

function noop () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  })
}

var debug = noop
if (util.debuglog)
  debug = util.debuglog('gfs4')
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util.format.apply(util, arguments)
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ')
    console.error(m)
  }

// Once time initialization
if (!fs[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = global[gracefulQueue] || []
  publishQueue(fs, queue)

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          resetQueue()
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments)
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    })
    return close
  })(fs.close)

  fs.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs, arguments)
      resetQueue()
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    })
    return closeSync
  })(fs.closeSync)

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(fs[gracefulQueue])
      __nccwpck_require__(9491).equal(fs[gracefulQueue].length, 0)
    })
  }
}

if (!global[gracefulQueue]) {
  publishQueue(global, fs[gracefulQueue]);
}

module.exports = patch(clone(fs))
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs)
    fs.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs)
  fs.gracefulify = patch

  fs.createReadStream = createReadStream
  fs.createWriteStream = createWriteStream
  var fs$readFile = fs.readFile
  fs.readFile = readFile
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb, startTime) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile
  fs.writeFile = writeFile
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb, startTime) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile
  if (fs$appendFile)
    fs.appendFile = appendFile
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb, startTime) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
        }
      })
    }
  }

  var fs$copyFile = fs.copyFile
  if (fs$copyFile)
    fs.copyFile = copyFile
  function copyFile (src, dest, flags, cb) {
    if (typeof flags === 'function') {
      cb = flags
      flags = 0
    }
    return go$copyFile(src, dest, flags, cb)

    function go$copyFile (src, dest, flags, cb, startTime) {
      return fs$copyFile(src, dest, flags, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
        }
      })
    }
  }

  var fs$readdir = fs.readdir
  fs.readdir = readdir
  var noReaddirOptionVersions = /^v[0-5]\./
  function readdir (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null

    var go$readdir = noReaddirOptionVersions.test(process.version)
      ? function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, fs$readdirCallback(
          path, options, cb, startTime
        ))
      }
      : function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, options, fs$readdirCallback(
          path, options, cb, startTime
        ))
      }

    return go$readdir(path, options, cb)

    function fs$readdirCallback (path, options, cb, startTime) {
      return function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([
            go$readdir,
            [path, options, cb],
            err,
            startTime || Date.now(),
            Date.now()
          ])
        else {
          if (files && files.sort)
            files.sort()

          if (typeof cb === 'function')
            cb.call(this, err, files)
        }
      }
    }
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs)
    ReadStream = legStreams.ReadStream
    WriteStream = legStreams.WriteStream
  }

  var fs$ReadStream = fs.ReadStream
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype)
    ReadStream.prototype.open = ReadStream$open
  }

  var fs$WriteStream = fs.WriteStream
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype)
    WriteStream.prototype.open = WriteStream$open
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  // legacy names
  var FileReadStream = ReadStream
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val
    },
    enumerable: true,
    configurable: true
  })
  var FileWriteStream = WriteStream
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val
    },
    enumerable: true,
    configurable: true
  })

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy()

        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
        that.read()
      }
    })
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy()
        that.emit('error', err)
      } else {
        that.fd = fd
        that.emit('open', fd)
      }
    })
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open
  fs.open = open
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb, startTime) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()])
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments)
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1])
  fs[gracefulQueue].push(elem)
  retry()
}

// keep track of the timeout between retry() calls
var retryTimer

// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue () {
  var now = Date.now()
  for (var i = 0; i < fs[gracefulQueue].length; ++i) {
    // entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs[gracefulQueue][i].length > 2) {
      fs[gracefulQueue][i][3] = now // startTime
      fs[gracefulQueue][i][4] = now // lastTime
    }
  }
  // call retry to make sure we're actively processing the queue
  retry()
}

function retry () {
  // clear the timer and remove it to help prevent unintended concurrency
  clearTimeout(retryTimer)
  retryTimer = undefined

  if (fs[gracefulQueue].length === 0)
    return

  var elem = fs[gracefulQueue].shift()
  var fn = elem[0]
  var args = elem[1]
  // these items may be unset if they were added by an older graceful-fs
  var err = elem[2]
  var startTime = elem[3]
  var lastTime = elem[4]

  // if we don't have a startTime we have no way of knowing if we've waited
  // long enough, so go ahead and retry this item now
  if (startTime === undefined) {
    debug('RETRY', fn.name, args)
    fn.apply(null, args)
  } else if (Date.now() - startTime >= 60000) {
    // it's been more than 60 seconds total, bail now
    debug('TIMEOUT', fn.name, args)
    var cb = args.pop()
    if (typeof cb === 'function')
      cb.call(null, err)
  } else {
    // the amount of time between the last attempt and right now
    var sinceAttempt = Date.now() - lastTime
    // the amount of time between when we first tried, and when we last tried
    // rounded up to at least 1
    var sinceStart = Math.max(lastTime - startTime, 1)
    // backoff. wait longer than the total time we've been retrying, but only
    // up to a maximum of 100ms
    var desiredDelay = Math.min(sinceStart * 1.2, 100)
    // it's been long enough since the last retry, do it again
    if (sinceAttempt >= desiredDelay) {
      debug('RETRY', fn.name, args)
      fn.apply(null, args.concat([startTime]))
    } else {
      // if we can't do this job yet, push it to the end of the queue
      // and let the next iteration check again
      fs[gracefulQueue].push(elem)
    }
  }

  // schedule our next run if one isn't already scheduled
  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0)
  }
}


/***/ }),

/***/ 3086:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Stream = (__nccwpck_require__(2781).Stream)

module.exports = legacy

function legacy (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    })
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}


/***/ }),

/***/ 263:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var constants = __nccwpck_require__(2057)

var origCwd = process.cwd
var cwd = null

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process)
  return cwd
}
try {
  process.cwd()
} catch (er) {}

// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
  var chdir = process.chdir
  process.chdir = function (d) {
    cwd = null
    chdir.call(process, d)
  }
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir)
}

module.exports = patch

function patch (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs)
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs)
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown)
  fs.fchown = chownFix(fs.fchown)
  fs.lchown = chownFix(fs.lchown)

  fs.chmod = chmodFix(fs.chmod)
  fs.fchmod = chmodFix(fs.fchmod)
  fs.lchmod = chmodFix(fs.lchmod)

  fs.chownSync = chownFixSync(fs.chownSync)
  fs.fchownSync = chownFixSync(fs.fchownSync)
  fs.lchownSync = chownFixSync(fs.lchownSync)

  fs.chmodSync = chmodFixSync(fs.chmodSync)
  fs.fchmodSync = chmodFixSync(fs.fchmodSync)
  fs.lchmodSync = chmodFixSync(fs.lchmodSync)

  fs.stat = statFix(fs.stat)
  fs.fstat = statFix(fs.fstat)
  fs.lstat = statFix(fs.lstat)

  fs.statSync = statFixSync(fs.statSync)
  fs.fstatSync = statFixSync(fs.fstatSync)
  fs.lstatSync = statFixSync(fs.lstatSync)

  // if lchmod/lchown do not exist, then make them no-ops
  if (fs.chmod && !fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchmodSync = function () {}
  }
  if (fs.chown && !fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb)
    }
    fs.lchownSync = function () {}
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = typeof fs.rename !== 'function' ? fs.rename
    : (function (fs$rename) {
      function rename (from, to, cb) {
        var start = Date.now()
        var backoff = 0;
        fs$rename(from, to, function CB (er) {
          if (er
              && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY")
              && Date.now() - start < 60000) {
            setTimeout(function() {
              fs.stat(to, function (stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er)
              })
            }, backoff)
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er)
        })
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename)
      return rename
    })(fs.rename)
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = typeof fs.read !== 'function' ? fs.read
  : (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments)
        }
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read)
    return read
  })(fs.read)

  fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync
  : (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++
          continue
        }
        throw er
      }
    }
  }})(fs.readSync)

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err)
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2)
          })
        })
      })
    }

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true
      var ret
      try {
        ret = fs.fchmodSync(fd, mode)
        threw = false
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd)
          } catch (er) {}
        } else {
          fs.closeSync(fd)
        }
      }
      return ret
    }
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er)
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2)
            })
          })
        })
      }

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK)
        var ret
        var threw = true
        try {
          ret = fs.futimesSync(fd, at, mt)
          threw = false
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd)
            } catch (er) {}
          } else {
            fs.closeSync(fd)
          }
        }
        return ret
      }

    } else if (fs.futimes) {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb) }
      fs.lutimesSync = function () {}
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null
        if (cb) cb.apply(this, arguments)
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = null
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000
          if (stats.gid < 0) stats.gid += 0x100000000
        }
        if (cb) cb.apply(this, arguments)
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target)
      if (stats) {
        if (stats.uid < 0) stats.uid += 0x100000000
        if (stats.gid < 0) stats.gid += 0x100000000
      }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}


/***/ }),

/***/ 2492:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var wrappy = __nccwpck_require__(2940)
var reqs = Object.create(null)
var once = __nccwpck_require__(1223)

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
  } else {
    reqs[key] = [cb]
    return makeres(key)
  }
}

function makeres (key) {
  return once(function RES () {
    var cbs = reqs[key]
    var len = cbs.length
    var args = slice(arguments)

    // XXX It's somewhat ambiguous whether a new callback added in this
    // pass should be queued for later execution if something in the
    // list of callbacks throws, or if it should just be discarded.
    // However, it's such an edge case that it hardly matters, and either
    // choice is likely as surprising as the other.
    // As it happens, we do go ahead and schedule it for later execution.
    try {
      for (var i = 0; i < len; i++) {
        cbs[i].apply(null, args)
      }
    } finally {
      if (cbs.length > len) {
        // added more in the interim.
        // de-zalgo, just in case, but don't call again.
        cbs.splice(0, len)
        process.nextTick(function () {
          RES.apply(null, args)
        })
      } else {
        delete reqs[key]
      }
    }
  })
}

function slice (args) {
  var length = args.length
  var array = []

  for (var i = 0; i < length; i++) array[i] = args[i]
  return array
}


/***/ }),

/***/ 4124:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

try {
  var util = __nccwpck_require__(3837);
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = __nccwpck_require__(8544);
}


/***/ }),

/***/ 8544:
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ 893:
/***/ ((module) => {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ 2084:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var util = __nccwpck_require__(3837);
var PassThrough = __nccwpck_require__(7818);

module.exports = {
  Readable: Readable,
  Writable: Writable
};

util.inherits(Readable, PassThrough);
util.inherits(Writable, PassThrough);

// Patch the given method of instance so that the callback
// is executed once, before the actual method is called the
// first time.
function beforeFirstCall(instance, method, callback) {
  instance[method] = function() {
    delete instance[method];
    callback.apply(this, arguments);
    return this[method].apply(this, arguments);
  };
}

function Readable(fn, options) {
  if (!(this instanceof Readable))
    return new Readable(fn, options);

  PassThrough.call(this, options);

  beforeFirstCall(this, '_read', function() {
    var source = fn.call(this, options);
    var emit = this.emit.bind(this, 'error');
    source.on('error', emit);
    source.pipe(this);
  });

  this.emit('readable');
}

function Writable(fn, options) {
  if (!(this instanceof Writable))
    return new Writable(fn, options);

  PassThrough.call(this, options);

  beforeFirstCall(this, '_write', function() {
    var destination = fn.call(this, options);
    var emit = this.emit.bind(this, 'error');
    destination.on('error', emit);
    this.pipe(destination);
  });

  this.emit('writable');
}



/***/ }),

/***/ 5706:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/

var pna = __nccwpck_require__(7810);
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(__nccwpck_require__(5898));
util.inherits = __nccwpck_require__(4124);
/*</replacement>*/

var Readable = __nccwpck_require__(9140);
var Writable = __nccwpck_require__(4960);

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};

/***/ }),

/***/ 982:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;

var Transform = __nccwpck_require__(5072);

/*<replacement>*/
var util = Object.create(__nccwpck_require__(5898));
util.inherits = __nccwpck_require__(4124);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ 9140:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var pna = __nccwpck_require__(7810);
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = __nccwpck_require__(893);
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = (__nccwpck_require__(2361).EventEmitter);

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __nccwpck_require__(8745);
/*</replacement>*/

/*<replacement>*/

var Buffer = (__nccwpck_require__(5054).Buffer);
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(__nccwpck_require__(5898));
util.inherits = __nccwpck_require__(4124);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __nccwpck_require__(3837);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __nccwpck_require__(5454);
var destroyImpl = __nccwpck_require__(8999);
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || __nccwpck_require__(5706);

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = (__nccwpck_require__(4749)/* .StringDecoder */ .s);
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __nccwpck_require__(5706);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = (__nccwpck_require__(4749)/* .StringDecoder */ .s);
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, { hasUnpiped: false });
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

/***/ }),

/***/ 5072:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;

var Duplex = __nccwpck_require__(5706);

/*<replacement>*/
var util = Object.create(__nccwpck_require__(5898));
util.inherits = __nccwpck_require__(4124);
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ }),

/***/ 4960:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



/*<replacement>*/

var pna = __nccwpck_require__(7810);
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(__nccwpck_require__(5898));
util.inherits = __nccwpck_require__(4124);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __nccwpck_require__(7127)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __nccwpck_require__(8745);
/*</replacement>*/

/*<replacement>*/

var Buffer = (__nccwpck_require__(5054).Buffer);
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = __nccwpck_require__(8999);

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || __nccwpck_require__(5706);

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __nccwpck_require__(5706);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};

/***/ }),

/***/ 5454:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = (__nccwpck_require__(5054).Buffer);
var util = __nccwpck_require__(3837);

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}

/***/ }),

/***/ 8999:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


/*<replacement>*/

var pna = __nccwpck_require__(7810);
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        pna.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        pna.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        pna.nextTick(emitErrorNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        pna.nextTick(emitErrorNT, _this, err);
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};

/***/ }),

/***/ 8745:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(2781);


/***/ }),

/***/ 7818:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(2399).PassThrough


/***/ }),

/***/ 2399:
/***/ ((module, exports, __nccwpck_require__) => {

var Stream = __nccwpck_require__(2781);
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
  exports = module.exports = Stream.Readable;
  exports.Readable = Stream.Readable;
  exports.Writable = Stream.Writable;
  exports.Duplex = Stream.Duplex;
  exports.Transform = Stream.Transform;
  exports.PassThrough = Stream.PassThrough;
  exports.Stream = Stream;
} else {
  exports = module.exports = __nccwpck_require__(9140);
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = __nccwpck_require__(4960);
  exports.Duplex = __nccwpck_require__(5706);
  exports.Transform = __nccwpck_require__(5072);
  exports.PassThrough = __nccwpck_require__(982);
}


/***/ }),

/***/ 5054:
/***/ ((module, exports, __nccwpck_require__) => {

/* eslint-disable node/no-deprecated-api */
var buffer = __nccwpck_require__(4300)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 4749:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var Buffer = (__nccwpck_require__(5054).Buffer);
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.s = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ 5902:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var hashClear = __nccwpck_require__(1789),
    hashDelete = __nccwpck_require__(712),
    hashGet = __nccwpck_require__(5395),
    hashHas = __nccwpck_require__(5232),
    hashSet = __nccwpck_require__(7320);

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ 6608:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var listCacheClear = __nccwpck_require__(9792),
    listCacheDelete = __nccwpck_require__(7716),
    listCacheGet = __nccwpck_require__(5789),
    listCacheHas = __nccwpck_require__(9386),
    listCacheSet = __nccwpck_require__(7399);

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ 881:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getNative = __nccwpck_require__(4479),
    root = __nccwpck_require__(9882);

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ 938:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var mapCacheClear = __nccwpck_require__(1610),
    mapCacheDelete = __nccwpck_require__(6657),
    mapCacheGet = __nccwpck_require__(1372),
    mapCacheHas = __nccwpck_require__(609),
    mapCacheSet = __nccwpck_require__(5582);

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ 5793:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getNative = __nccwpck_require__(4479),
    root = __nccwpck_require__(9882);

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),

/***/ 2158:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var MapCache = __nccwpck_require__(938),
    setCacheAdd = __nccwpck_require__(6895),
    setCacheHas = __nccwpck_require__(804);

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),

/***/ 9213:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var root = __nccwpck_require__(9882);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ 9647:
/***/ ((module) => {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ 7183:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseIndexOf = __nccwpck_require__(5425);

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;


/***/ }),

/***/ 6732:
/***/ ((module) => {

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

module.exports = arrayIncludesWith;


/***/ }),

/***/ 2237:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseTimes = __nccwpck_require__(7765),
    isArguments = __nccwpck_require__(8495),
    isArray = __nccwpck_require__(4869),
    isBuffer = __nccwpck_require__(4190),
    isIndex = __nccwpck_require__(9819),
    isTypedArray = __nccwpck_require__(2496);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ 4356:
/***/ ((module) => {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ 82:
/***/ ((module) => {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),

/***/ 6752:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var eq = __nccwpck_require__(1901);

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ 1259:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var SetCache = __nccwpck_require__(2158),
    arrayIncludes = __nccwpck_require__(7183),
    arrayIncludesWith = __nccwpck_require__(6732),
    arrayMap = __nccwpck_require__(4356),
    baseUnary = __nccwpck_require__(9258),
    cacheHas = __nccwpck_require__(2675);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee == null ? value : iteratee(value);

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;


/***/ }),

/***/ 7265:
/***/ ((module) => {

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;


/***/ }),

/***/ 9588:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var arrayPush = __nccwpck_require__(82),
    isFlattenable = __nccwpck_require__(9299);

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;


/***/ }),

/***/ 7497:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Symbol = __nccwpck_require__(9213),
    getRawTag = __nccwpck_require__(923),
    objectToString = __nccwpck_require__(4200);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ 5425:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseFindIndex = __nccwpck_require__(7265),
    baseIsNaN = __nccwpck_require__(8048),
    strictIndexOf = __nccwpck_require__(8868);

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;


/***/ }),

/***/ 2177:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseGetTag = __nccwpck_require__(7497),
    isObjectLike = __nccwpck_require__(5926);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ 8048:
/***/ ((module) => {

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;


/***/ }),

/***/ 411:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var isFunction = __nccwpck_require__(7799),
    isMasked = __nccwpck_require__(9058),
    isObject = __nccwpck_require__(3334),
    toSource = __nccwpck_require__(6928);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ 1528:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseGetTag = __nccwpck_require__(7497),
    isLength = __nccwpck_require__(4530),
    isObjectLike = __nccwpck_require__(5926);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ 297:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var isObject = __nccwpck_require__(3334),
    isPrototype = __nccwpck_require__(10),
    nativeKeysIn = __nccwpck_require__(5383);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),

/***/ 2936:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var identity = __nccwpck_require__(7822),
    overRest = __nccwpck_require__(2417),
    setToString = __nccwpck_require__(8416);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ 979:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var constant = __nccwpck_require__(5946),
    defineProperty = __nccwpck_require__(416),
    identity = __nccwpck_require__(7822);

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ 7765:
/***/ ((module) => {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ 9258:
/***/ ((module) => {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ 9036:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var SetCache = __nccwpck_require__(2158),
    arrayIncludes = __nccwpck_require__(7183),
    arrayIncludesWith = __nccwpck_require__(6732),
    cacheHas = __nccwpck_require__(2675),
    createSet = __nccwpck_require__(6505),
    setToArray = __nccwpck_require__(9553);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;


/***/ }),

/***/ 2675:
/***/ ((module) => {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),

/***/ 8380:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var root = __nccwpck_require__(9882);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ 6505:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Set = __nccwpck_require__(5793),
    noop = __nccwpck_require__(6022),
    setToArray = __nccwpck_require__(9553);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

module.exports = createSet;


/***/ }),

/***/ 416:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getNative = __nccwpck_require__(4479);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ 2085:
/***/ ((module) => {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;


/***/ }),

/***/ 9980:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var isKeyable = __nccwpck_require__(3308);

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ 4479:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseIsNative = __nccwpck_require__(411),
    getValue = __nccwpck_require__(3542);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ 6271:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var overArg = __nccwpck_require__(6320);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),

/***/ 923:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Symbol = __nccwpck_require__(9213);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ 3542:
/***/ ((module) => {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ 1789:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var nativeCreate = __nccwpck_require__(3041);

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ 712:
/***/ ((module) => {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ 5395:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var nativeCreate = __nccwpck_require__(3041);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ 5232:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var nativeCreate = __nccwpck_require__(3041);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ 7320:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var nativeCreate = __nccwpck_require__(3041);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ 9299:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Symbol = __nccwpck_require__(9213),
    isArguments = __nccwpck_require__(8495),
    isArray = __nccwpck_require__(4869);

/** Built-in value references. */
var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

module.exports = isFlattenable;


/***/ }),

/***/ 9819:
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ 8494:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var eq = __nccwpck_require__(1901),
    isArrayLike = __nccwpck_require__(8017),
    isIndex = __nccwpck_require__(9819),
    isObject = __nccwpck_require__(3334);

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ 3308:
/***/ ((module) => {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ 9058:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var coreJsData = __nccwpck_require__(8380);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ 10:
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ 9792:
/***/ ((module) => {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ 7716:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var assocIndexOf = __nccwpck_require__(6752);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ 5789:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var assocIndexOf = __nccwpck_require__(6752);

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ 9386:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var assocIndexOf = __nccwpck_require__(6752);

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ 7399:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var assocIndexOf = __nccwpck_require__(6752);

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ 1610:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var Hash = __nccwpck_require__(5902),
    ListCache = __nccwpck_require__(6608),
    Map = __nccwpck_require__(881);

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ 6657:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getMapData = __nccwpck_require__(9980);

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ 1372:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getMapData = __nccwpck_require__(9980);

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ 609:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getMapData = __nccwpck_require__(9980);

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ 5582:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getMapData = __nccwpck_require__(9980);

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ 3041:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var getNative = __nccwpck_require__(4479);

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ 5383:
/***/ ((module) => {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),

/***/ 4643:
/***/ ((module, exports, __nccwpck_require__) => {

/* module decorator */ module = __nccwpck_require__.nmd(module);
var freeGlobal = __nccwpck_require__(2085);

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;


/***/ }),

/***/ 4200:
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ 6320:
/***/ ((module) => {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),

/***/ 2417:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var apply = __nccwpck_require__(9647);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ 9882:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var freeGlobal = __nccwpck_require__(2085);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ 6895:
/***/ ((module) => {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),

/***/ 804:
/***/ ((module) => {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),

/***/ 9553:
/***/ ((module) => {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),

/***/ 8416:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseSetToString = __nccwpck_require__(979),
    shortOut = __nccwpck_require__(7882);

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ 7882:
/***/ ((module) => {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ 8868:
/***/ ((module) => {

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = strictIndexOf;


/***/ }),

/***/ 6928:
/***/ ((module) => {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ 5946:
/***/ ((module) => {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ 3508:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseRest = __nccwpck_require__(2936),
    eq = __nccwpck_require__(1901),
    isIterateeCall = __nccwpck_require__(8494),
    keysIn = __nccwpck_require__(9109);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = baseRest(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

module.exports = defaults;


/***/ }),

/***/ 4031:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseDifference = __nccwpck_require__(1259),
    baseFlatten = __nccwpck_require__(9588),
    baseRest = __nccwpck_require__(2936),
    isArrayLikeObject = __nccwpck_require__(7996);

/**
 * Creates an array of `array` values not included in the other given arrays
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. The order and references of result values are
 * determined by the first array.
 *
 * **Note:** Unlike `_.pullAll`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see _.without, _.xor
 * @example
 *
 * _.difference([2, 1], [2, 3]);
 * // => [1]
 */
var difference = baseRest(function(array, values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
    : [];
});

module.exports = difference;


/***/ }),

/***/ 1901:
/***/ ((module) => {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ 2394:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseFlatten = __nccwpck_require__(9588);

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

module.exports = flatten;


/***/ }),

/***/ 7822:
/***/ ((module) => {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ 8495:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseIsArguments = __nccwpck_require__(2177),
    isObjectLike = __nccwpck_require__(5926);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ 4869:
/***/ ((module) => {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ 8017:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var isFunction = __nccwpck_require__(7799),
    isLength = __nccwpck_require__(4530);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ 7996:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var isArrayLike = __nccwpck_require__(8017),
    isObjectLike = __nccwpck_require__(5926);

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),

/***/ 4190:
/***/ ((module, exports, __nccwpck_require__) => {

/* module decorator */ module = __nccwpck_require__.nmd(module);
var root = __nccwpck_require__(9882),
    stubFalse = __nccwpck_require__(7744);

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;


/***/ }),

/***/ 7799:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseGetTag = __nccwpck_require__(7497),
    isObject = __nccwpck_require__(3334);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ 4530:
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ 3334:
/***/ ((module) => {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ 5926:
/***/ ((module) => {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ 6169:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseGetTag = __nccwpck_require__(7497),
    getPrototype = __nccwpck_require__(6271),
    isObjectLike = __nccwpck_require__(5926);

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),

/***/ 2496:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseIsTypedArray = __nccwpck_require__(1528),
    baseUnary = __nccwpck_require__(9258),
    nodeUtil = __nccwpck_require__(4643);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ 9109:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var arrayLikeKeys = __nccwpck_require__(2237),
    baseKeysIn = __nccwpck_require__(297),
    isArrayLike = __nccwpck_require__(8017);

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),

/***/ 6022:
/***/ ((module) => {

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;


/***/ }),

/***/ 7744:
/***/ ((module) => {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ 1620:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var baseFlatten = __nccwpck_require__(9588),
    baseRest = __nccwpck_require__(2936),
    baseUniq = __nccwpck_require__(9036),
    isArrayLikeObject = __nccwpck_require__(7996);

/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */
var union = baseRest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});

module.exports = union;


/***/ }),

/***/ 5388:
/***/ ((module) => {

/*!
 * normalize-path <https://github.com/jonschlinkert/normalize-path>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

module.exports = function(path, stripTrailing) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') return '/';

  var len = path.length;
  if (len <= 1) return path;

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  var prefix = '';
  if (len > 4 && path[3] === '\\') {
    var ch = path[2];
    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2);
      prefix = '//';
    }
  }

  var segs = path.split(/[/\\]+/);
  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }
  return prefix + segs.join('/');
};


/***/ }),

/***/ 1223:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var wrappy = __nccwpck_require__(2940)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 7810:
/***/ ((module) => {

"use strict";


if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}



/***/ }),

/***/ 5322:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = (typeof process !== 'undefined' && typeof process.nextTick === 'function')
  ? process.nextTick.bind(process)
  : __nccwpck_require__(1031)


/***/ }),

/***/ 1031:
/***/ ((module) => {

module.exports = typeof queueMicrotask === 'function' ? queueMicrotask : (fn) => Promise.resolve().then(fn)


/***/ }),

/***/ 7214:
/***/ ((module) => {

"use strict";


const codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error
  }

  function getMessage (arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message
    } else {
      return message(arg1, arg2, arg3)
    }
  }

  class NodeError extends Base {
    constructor (arg1, arg2, arg3) {
      super(getMessage(arg1, arg2, arg3));
    }
  }

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;

  codes[code] = NodeError;
}

// https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js
function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    const len = expected.length;
    expected = expected.map((i) => String(i));
    if (len > 2) {
      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` +
             expected[len - 1];
    } else if (len === 2) {
      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
    } else {
      return `of ${thing} ${expected[0]}`;
    }
  } else {
    return `of ${thing} ${String(expected)}`;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
function startsWith(str, search, pos) {
	return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
function endsWith(str, search, this_len) {
	if (this_len === undefined || this_len > str.length) {
		this_len = str.length;
	}
	return str.substring(this_len - search.length, this_len) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"'
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  let determiner;
  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  let msg;
  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
  } else {
    const type = includes(name, '.') ? 'property' : 'argument';
    msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
  }

  msg += `. Received type ${typeof actual}`;
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented'
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');

module.exports.q = codes;


/***/ }),

/***/ 1359:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

module.exports = Duplex;
var Readable = __nccwpck_require__(1433);
var Writable = __nccwpck_require__(6993);
__nccwpck_require__(4124)(Duplex, Readable);
{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;
    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

// the no-half-open enforcer
function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

/***/ }),

/***/ 1542:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;
var Transform = __nccwpck_require__(4415);
__nccwpck_require__(4124)(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ 1433:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



module.exports = Readable;

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = (__nccwpck_require__(2361).EventEmitter);
var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __nccwpck_require__(2387);
/*</replacement>*/

var Buffer = (__nccwpck_require__(4300).Buffer);
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*<replacement>*/
var debugUtil = __nccwpck_require__(3837);
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = __nccwpck_require__(6522);
var destroyImpl = __nccwpck_require__(7049);
var _require = __nccwpck_require__(9948),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = (__nccwpck_require__(7214)/* .codes */ .q),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

// Lazy loaded to improve the startup performance.
var StringDecoder;
var createReadableStreamAsyncIterator;
var from;
__nccwpck_require__(4124)(Readable, Stream);
var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || __nccwpck_require__(1359);
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish')
  this.autoDestroy = !!options.autoDestroy;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = (__nccwpck_require__(4841)/* .StringDecoder */ .s);
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  Duplex = Duplex || __nccwpck_require__(1359);
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);

  // legacy
  this.readable = true;
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }
  Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }
  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }
  return er;
}
Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = (__nccwpck_require__(4841)/* .StringDecoder */ .s);
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8
  this._readableState.encoding = this._readableState.decoder.encoding;

  // Iterate over current buffer to convert already stored Buffers:
  var p = this._readableState.buffer.head;
  var content = '';
  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }
  this._readableState.buffer.clear();
  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null) this.emit('data', ret);
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state.paused = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState.paused = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;
  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }
    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };
  return this;
};
if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = __nccwpck_require__(3306);
    }
    return createReadableStreamAsyncIterator(this);
  };
}
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;
      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}
if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = __nccwpck_require__(9082);
    }
    return from(Readable, iterable, opts);
  };
}
function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

/***/ }),

/***/ 4415:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;
var _require$codes = (__nccwpck_require__(7214)/* .codes */ .q),
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
var Duplex = __nccwpck_require__(1359);
__nccwpck_require__(4124)(Transform, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};
Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};
Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};
function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null)
    // single equals check for both `null` and `undefined`
    stream.push(data);

  // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}

/***/ }),

/***/ 6993:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;
  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var internalUtil = {
  deprecate: __nccwpck_require__(7127)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __nccwpck_require__(2387);
/*</replacement>*/

var Buffer = (__nccwpck_require__(4300).Buffer);
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = __nccwpck_require__(7049);
var _require = __nccwpck_require__(9948),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = (__nccwpck_require__(7214)/* .codes */ .q),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
__nccwpck_require__(4124)(Writable, Stream);
function nop() {}
function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || __nccwpck_require__(1359);
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end')
  this.autoDestroy = !!options.autoDestroy;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}
function Writable(options) {
  Duplex = Duplex || __nccwpck_require__(1359);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);

  // legacy.
  this.writable = true;
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }
  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  // TODO: defer error events consistently everywhere, not just the cb
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var er;
  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }
  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }
  return true;
}
Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);
  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};
Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }
  return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}
function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;
    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }
    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }
    if (entry === null) state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
  return this;
};
Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});
function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      errorOrDestroy(stream, err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;
        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }
  return need;
}
function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}
function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};

/***/ }),

/***/ 3306:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var _Object$setPrototypeO;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var finished = __nccwpck_require__(6080);
var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');
function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}
function readAndResolve(iter) {
  var resolve = iter[kLastResolve];
  if (resolve !== null) {
    var data = iter[kStream].read();
    // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'
    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}
function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }
      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },
  next: function next() {
    var _this = this;
    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];
    if (error !== null) {
      return Promise.reject(error);
    }
    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }
    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time
    var lastPromise = this[kLastPromise];
    var promise;
    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();
      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }
      promise = new Promise(this[kHandlePromise]);
    }
    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;
  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;
  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();
      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];
      // reject if we are waiting for data in the Promise
      // returned by next() and store the error
      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }
      iterator[kError] = err;
      return;
    }
    var resolve = iterator[kLastResolve];
    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }
    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};
module.exports = createReadableStreamAsyncIterator;

/***/ }),

/***/ 6522:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __nccwpck_require__(4300),
  Buffer = _require.Buffer;
var _require2 = __nccwpck_require__(3837),
  inspect = _require2.inspect;
var custom = inspect && inspect.custom || 'inspect';
function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}
module.exports = /*#__PURE__*/function () {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while (p = p.next) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;
      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }

    // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}();

/***/ }),

/***/ 7049:
/***/ ((module) => {

"use strict";


// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });
  return this;
}
function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit('error', err);
}
function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}
module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};

/***/ }),

/***/ 6080:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).



var ERR_STREAM_PREMATURE_CLOSE = (__nccwpck_require__(7214)/* .codes.ERR_STREAM_PREMATURE_CLOSE */ .q.ERR_STREAM_PREMATURE_CLOSE);
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    callback.apply(this, args);
  };
}
function noop() {}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };
  var writableEnded = stream._writableState && stream._writableState.finished;
  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };
  var readableEnded = stream._readableState && stream._readableState.endEmitted;
  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var onclose = function onclose() {
    var err;
    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}
module.exports = eos;

/***/ }),

/***/ 9082:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ERR_INVALID_ARG_TYPE = (__nccwpck_require__(7214)/* .codes.ERR_INVALID_ARG_TYPE */ .q.ERR_INVALID_ARG_TYPE);
function from(Readable, iterable, opts) {
  var iterator;
  if (iterable && typeof iterable.next === 'function') {
    iterator = iterable;
  } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();else throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
  var readable = new Readable(_objectSpread({
    objectMode: true
  }, opts));
  // Reading boolean to protect against _read
  // being called before last iteration completion.
  var reading = false;
  readable._read = function () {
    if (!reading) {
      reading = true;
      next();
    }
  };
  function next() {
    return _next2.apply(this, arguments);
  }
  function _next2() {
    _next2 = _asyncToGenerator(function* () {
      try {
        var _yield$iterator$next = yield iterator.next(),
          value = _yield$iterator$next.value,
          done = _yield$iterator$next.done;
        if (done) {
          readable.push(null);
        } else if (readable.push(yield value)) {
          next();
        } else {
          reading = false;
        }
      } catch (err) {
        readable.destroy(err);
      }
    });
    return _next2.apply(this, arguments);
  }
  return readable;
}
module.exports = from;


/***/ }),

/***/ 6989:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).



var eos;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}
var _require$codes = (__nccwpck_require__(7214)/* .codes */ .q),
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = __nccwpck_require__(6080);
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}
function call(fn) {
  fn();
}
function pipe(from, to) {
  return from.pipe(to);
}
function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}
module.exports = pipeline;

/***/ }),

/***/ 9948:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var ERR_INVALID_OPT_VALUE = (__nccwpck_require__(7214)/* .codes.ERR_INVALID_OPT_VALUE */ .q.ERR_INVALID_OPT_VALUE);
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }
    return Math.floor(hwm);
  }

  // Default value
  return state.objectMode ? 16 : 16 * 1024;
}
module.exports = {
  getHighWaterMark: getHighWaterMark
};

/***/ }),

/***/ 2387:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(2781);


/***/ }),

/***/ 1642:
/***/ ((module, exports, __nccwpck_require__) => {

var Stream = __nccwpck_require__(2781);
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream.Readable;
  Object.assign(module.exports, Stream);
  module.exports.Stream = Stream;
} else {
  exports = module.exports = __nccwpck_require__(1433);
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = __nccwpck_require__(6993);
  exports.Duplex = __nccwpck_require__(1359);
  exports.Transform = __nccwpck_require__(4415);
  exports.PassThrough = __nccwpck_require__(1542);
  exports.finished = __nccwpck_require__(6080);
  exports.pipeline = __nccwpck_require__(6989);
}


/***/ }),

/***/ 7978:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = readdirGlob;

const fs = __nccwpck_require__(7147);
const { EventEmitter } = __nccwpck_require__(2361);
const { Minimatch } = __nccwpck_require__(7771);
const { resolve } = __nccwpck_require__(1017);

function readdir(dir, strict) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, {withFileTypes: true} ,(err, files) => {
      if(err) {
        switch (err.code) {
          case 'ENOTDIR':      // Not a directory
            if(strict) {
              reject(err);
            } else {
              resolve([]);
            }
            break;
          case 'ENOTSUP':      // Operation not supported
          case 'ENOENT':       // No such file or directory
          case 'ENAMETOOLONG': // Filename too long
          case 'UNKNOWN':
            resolve([]);
            break;
          case 'ELOOP':        // Too many levels of symbolic links
          default:
            reject(err);
            break;
        }
      } else {
        resolve(files);
      }
    });
  });
}
function stat(file, followSymlinks) {
  return new Promise((resolve, reject) => {
    const statFunc = followSymlinks ? fs.stat : fs.lstat;
    statFunc(file, (err, stats) => {
      if(err) {
        switch (err.code) {
          case 'ENOENT':
            if(followSymlinks) {
              // Fallback to lstat to handle broken links as files
              resolve(stat(file, false)); 
            } else {
              resolve(null);
            }
            break;
          default:
            resolve(null);
            break;
        }
      } else {
        resolve(stats);
      }
    });
  });
}

async function* exploreWalkAsync(dir, path, followSymlinks, useStat, shouldSkip, strict) {
  let files = await readdir(path + dir, strict);
  for(const file of files) {
    let name = file.name;
    if(name === undefined) {
      // undefined file.name means the `withFileTypes` options is not supported by node
      // we have to call the stat function to know if file is directory or not.
      name = file;
      useStat = true;
    }
    const filename = dir + '/' + name;
    const relative = filename.slice(1); // Remove the leading /
    const absolute = path + '/' + relative;
    let stats = null;
    if(useStat || followSymlinks) {
      stats = await stat(absolute, followSymlinks);
    }
    if(!stats && file.name !== undefined) {
      stats = file;
    }
    if(stats === null) {
      stats = { isDirectory: () => false };
    }

    if(stats.isDirectory()) {
      if(!shouldSkip(relative)) {
        yield {relative, absolute, stats};
        yield* exploreWalkAsync(filename, path, followSymlinks, useStat, shouldSkip, false);
      }
    } else {
      yield {relative, absolute, stats};
    }
  }
}
async function* explore(path, followSymlinks, useStat, shouldSkip) {
  yield* exploreWalkAsync('', path, followSymlinks, useStat, shouldSkip, true);
}


function readOptions(options) {
  return {
    pattern: options.pattern,
    dot: !!options.dot,
    noglobstar: !!options.noglobstar,
    matchBase: !!options.matchBase,
    nocase: !!options.nocase,
    ignore: options.ignore,
    skip: options.skip,

    follow: !!options.follow,
    stat: !!options.stat,
    nodir: !!options.nodir,
    mark: !!options.mark,
    silent: !!options.silent,
    absolute: !!options.absolute
  };
}

class ReaddirGlob extends EventEmitter {
  constructor(cwd, options, cb) {
    super();
    if(typeof options === 'function') {
      cb = options;
      options = null;
    }

    this.options = readOptions(options || {});
  
    this.matchers = [];
    if(this.options.pattern) {
      const matchers = Array.isArray(this.options.pattern) ? this.options.pattern : [this.options.pattern];
      this.matchers = matchers.map( m =>
        new Minimatch(m, {
          dot: this.options.dot,
          noglobstar:this.options.noglobstar,
          matchBase:this.options.matchBase,
          nocase:this.options.nocase
        })
      );
    }
  
    this.ignoreMatchers = [];
    if(this.options.ignore) {
      const ignorePatterns = Array.isArray(this.options.ignore) ? this.options.ignore : [this.options.ignore];
      this.ignoreMatchers = ignorePatterns.map( ignore =>
        new Minimatch(ignore, {dot: true})
      );
    }
  
    this.skipMatchers = [];
    if(this.options.skip) {
      const skipPatterns = Array.isArray(this.options.skip) ? this.options.skip : [this.options.skip];
      this.skipMatchers = skipPatterns.map( skip =>
        new Minimatch(skip, {dot: true})
      );
    }

    this.iterator = explore(resolve(cwd || '.'), this.options.follow, this.options.stat, this._shouldSkipDirectory.bind(this));
    this.paused = false;
    this.inactive = false;
    this.aborted = false;
  
    if(cb) {
      this._matches = []; 
      this.on('match', match => this._matches.push(this.options.absolute ? match.absolute : match.relative));
      this.on('error', err => cb(err));
      this.on('end', () => cb(null, this._matches));
    }

    setTimeout( () => this._next(), 0);
  }

  _shouldSkipDirectory(relative) {
    //console.log(relative, this.skipMatchers.some(m => m.match(relative)));
    return this.skipMatchers.some(m => m.match(relative));
  }

  _fileMatches(relative, isDirectory) {
    const file = relative + (isDirectory ? '/' : '');
    return (this.matchers.length === 0 || this.matchers.some(m => m.match(file)))
      && !this.ignoreMatchers.some(m => m.match(file))
      && (!this.options.nodir || !isDirectory);
  }

  _next() {
    if(!this.paused && !this.aborted) {
      this.iterator.next()
      .then((obj)=> {
        if(!obj.done) {
          const isDirectory = obj.value.stats.isDirectory();
          if(this._fileMatches(obj.value.relative, isDirectory )) {
            let relative = obj.value.relative;
            let absolute = obj.value.absolute;
            if(this.options.mark && isDirectory) {
              relative += '/';
              absolute += '/';
            }
            if(this.options.stat) {
              this.emit('match', {relative, absolute, stat:obj.value.stats});
            } else {
              this.emit('match', {relative, absolute});
            }
          }
          this._next(this.iterator);
        } else {
          this.emit('end');
        }
      })
      .catch((err) => {
        this.abort();
        this.emit('error', err);
        if(!err.code && !this.options.silent) {
          console.error(err);
        }
      });
    } else {
      this.inactive = true;
    }
  }

  abort() {
    this.aborted = true;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    if(this.inactive) {
      this.inactive = false;
      this._next();
    }
  }
}


function readdirGlob(pattern, options, cb) {
  return new ReaddirGlob(pattern, options, cb);
}
readdirGlob.ReaddirGlob = ReaddirGlob;

/***/ }),

/***/ 226:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var balanced = __nccwpck_require__(9417);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m) return [str];

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  if (/\$$/.test(m.pre)) {    
    for (var k = 0; k < post.length; k++) {
      var expansion = pre+ '{' + m.body + '}' + post[k];
      expansions.push(expansion);
    }
  } else {
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(',') >= 0;
    if (!isSequence && !isOptions) {
      // {a},b}
      if (m.post.match(/,.*\}/)) {
        str = m.pre + '{' + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }

    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        // x{{a,b}}y ==> x{a}y x{b}y
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }

    // at this point, n is the parts, and we know it's not a comma set
    // with a single entry.
    var N;

    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length)
      var incr = n.length == 3
        ? Math.abs(numeric(n[2]))
        : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);

      N = [];

      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === '\\')
            c = '';
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join('0');
              if (i < 0)
                c = '-' + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = [];

      for (var j = 0; j < n.length; j++) {
        N.push.apply(N, expand(n[j], false));
      }
    }

    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
  }

  return expansions;
}



/***/ }),

/***/ 9482:
/***/ ((module) => {

const isWindows = typeof process === 'object' &&
  process &&
  process.platform === 'win32'
module.exports = isWindows ? { sep: '\\' } : { sep: '/' }


/***/ }),

/***/ 7771:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const minimatch = module.exports = (p, pattern, options = {}) => {
  assertValidPattern(pattern)

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  return new Minimatch(pattern, options).match(p)
}

module.exports = minimatch

const path = __nccwpck_require__(9482)
minimatch.sep = path.sep

const GLOBSTAR = Symbol('globstar **')
minimatch.GLOBSTAR = GLOBSTAR
const expand = __nccwpck_require__(226)

const plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
const qmark = '[^/]'

// * => any number of characters
const star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
const twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
const twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// "abc" -> { a:true, b:true, c:true }
const charSet = s => s.split('').reduce((set, c) => {
  set[c] = true
  return set
}, {})

// characters that need to be escaped in RegExp.
const reSpecials = charSet('().*{}+?[]^$\\!')

// characters that indicate we have to add the pattern start
const addPatternStartSet = charSet('[.(')

// normalizes slashes.
const slashSplit = /\/+/

minimatch.filter = (pattern, options = {}) =>
  (p, i, list) => minimatch(p, pattern, options)

const ext = (a, b = {}) => {
  const t = {}
  Object.keys(a).forEach(k => t[k] = a[k])
  Object.keys(b).forEach(k => t[k] = b[k])
  return t
}

minimatch.defaults = def => {
  if (!def || typeof def !== 'object' || !Object.keys(def).length) {
    return minimatch
  }

  const orig = minimatch

  const m = (p, pattern, options) => orig(p, pattern, ext(def, options))
  m.Minimatch = class Minimatch extends orig.Minimatch {
    constructor (pattern, options) {
      super(pattern, ext(def, options))
    }
  }
  m.Minimatch.defaults = options => orig.defaults(ext(def, options)).Minimatch
  m.filter = (pattern, options) => orig.filter(pattern, ext(def, options))
  m.defaults = options => orig.defaults(ext(def, options))
  m.makeRe = (pattern, options) => orig.makeRe(pattern, ext(def, options))
  m.braceExpand = (pattern, options) => orig.braceExpand(pattern, ext(def, options))
  m.match = (list, pattern, options) => orig.match(list, pattern, ext(def, options))

  return m
}





// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = (pattern, options) => braceExpand(pattern, options)

const braceExpand = (pattern, options = {}) => {
  assertValidPattern(pattern)

  // Thanks to Yeting Li <https://github.com/yetingli> for
  // improving this regexp to avoid a ReDOS vulnerability.
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

const MAX_PATTERN_LENGTH = 1024 * 64
const assertValidPattern = pattern => {
  if (typeof pattern !== 'string') {
    throw new TypeError('invalid pattern')
  }

  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError('pattern is too long')
  }
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
const SUBPARSE = Symbol('subparse')

minimatch.makeRe = (pattern, options) =>
  new Minimatch(pattern, options || {}).makeRe()

minimatch.match = (list, pattern, options = {}) => {
  const mm = new Minimatch(pattern, options)
  list = list.filter(f => mm.match(f))
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

// replace stuff like \* with *
const globUnescape = s => s.replace(/\\(.)/g, '$1')
const charUnescape = s => s.replace(/\\([^-\]])/g, '$1')
const regExpEscape = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const braExpEscape = s => s.replace(/[[\]\\]/g, '\\$&')

class Minimatch {
  constructor (pattern, options) {
    assertValidPattern(pattern)

    if (!options) options = {}

    this.options = options
    this.set = []
    this.pattern = pattern
    this.windowsPathsNoEscape = !!options.windowsPathsNoEscape ||
      options.allowWindowsEscape === false
    if (this.windowsPathsNoEscape) {
      this.pattern = this.pattern.replace(/\\/g, '/')
    }
    this.regexp = null
    this.negate = false
    this.comment = false
    this.empty = false
    this.partial = !!options.partial

    // make the set of regexps etc.
    this.make()
  }

  debug () {}

  make () {
    const pattern = this.pattern
    const options = this.options

    // empty patterns and comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
      this.comment = true
      return
    }
    if (!pattern) {
      this.empty = true
      return
    }

    // step 1: figure out negation, etc.
    this.parseNegate()

    // step 2: expand braces
    let set = this.globSet = this.braceExpand()

    if (options.debug) this.debug = (...args) => console.error(...args)

    this.debug(this.pattern, set)

    // step 3: now we have a set, so turn each one into a series of path-portion
    // matching patterns.
    // These will be regexps, except in the case of "**", which is
    // set to the GLOBSTAR object for globstar behavior,
    // and will not contain any / characters
    set = this.globParts = set.map(s => s.split(slashSplit))

    this.debug(this.pattern, set)

    // glob --> regexps
    set = set.map((s, si, set) => s.map(this.parse, this))

    this.debug(this.pattern, set)

    // filter out everything that didn't compile properly.
    set = set.filter(s => s.indexOf(false) === -1)

    this.debug(this.pattern, set)

    this.set = set
  }

  parseNegate () {
    if (this.options.nonegate) return

    const pattern = this.pattern
    let negate = false
    let negateOffset = 0

    for (let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++) {
      negate = !negate
      negateOffset++
    }

    if (negateOffset) this.pattern = pattern.slice(negateOffset)
    this.negate = negate
  }

  // set partial to true to test if, for example,
  // "/a/b" matches the start of "/*/b/*/d"
  // Partial means, if you run out of file before you run
  // out of pattern, then that's fine, as long as all
  // the parts match.
  matchOne (file, pattern, partial) {
    var options = this.options

    this.debug('matchOne',
      { 'this': this, file: file, pattern: pattern })

    this.debug('matchOne', file.length, pattern.length)

    for (var fi = 0,
        pi = 0,
        fl = file.length,
        pl = pattern.length
        ; (fi < fl) && (pi < pl)
        ; fi++, pi++) {
      this.debug('matchOne loop')
      var p = pattern[pi]
      var f = file[fi]

      this.debug(pattern, p, f)

      // should be impossible.
      // some invalid regexp stuff in the set.
      /* istanbul ignore if */
      if (p === false) return false

      if (p === GLOBSTAR) {
        this.debug('GLOBSTAR', [pattern, p, f])

        // "**"
        // a/**/b/**/c would match the following:
        // a/b/x/y/z/c
        // a/x/y/z/b/c
        // a/b/x/b/x/c
        // a/b/c
        // To do this, take the rest of the pattern after
        // the **, and see if it would match the file remainder.
        // If so, return success.
        // If not, the ** "swallows" a segment, and try again.
        // This is recursively awful.
        //
        // a/**/b/**/c matching a/b/x/y/z/c
        // - a matches a
        // - doublestar
        //   - matchOne(b/x/y/z/c, b/**/c)
        //     - b matches b
        //     - doublestar
        //       - matchOne(x/y/z/c, c) -> no
        //       - matchOne(y/z/c, c) -> no
        //       - matchOne(z/c, c) -> no
        //       - matchOne(c, c) yes, hit
        var fr = fi
        var pr = pi + 1
        if (pr === pl) {
          this.debug('** at the end')
          // a ** at the end will just swallow the rest.
          // We have found a match.
          // however, it will not swallow /.x, unless
          // options.dot is set.
          // . and .. are *never* matched by **, for explosively
          // exponential reasons.
          for (; fi < fl; fi++) {
            if (file[fi] === '.' || file[fi] === '..' ||
              (!options.dot && file[fi].charAt(0) === '.')) return false
          }
          return true
        }

        // ok, let's see if we can swallow whatever we can.
        while (fr < fl) {
          var swallowee = file[fr]

          this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

          // XXX remove this slice.  Just pass the start index.
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug('globstar found match!', fr, fl, swallowee)
            // found a match.
            return true
          } else {
            // can't swallow "." or ".." ever.
            // can only swallow ".foo" when explicitly asked.
            if (swallowee === '.' || swallowee === '..' ||
              (!options.dot && swallowee.charAt(0) === '.')) {
              this.debug('dot detected!', file, fr, pattern, pr)
              break
            }

            // ** swallows a segment, and continue.
            this.debug('globstar swallow a segment, and continue')
            fr++
          }
        }

        // no match was found.
        // However, in partial mode, we can't say this is necessarily over.
        // If there's more *pattern* left, then
        /* istanbul ignore if */
        if (partial) {
          // ran out of file
          this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
          if (fr === fl) return true
        }
        return false
      }

      // something other than **
      // non-magic patterns just have to match exactly
      // patterns with magic have been turned into regexps.
      var hit
      if (typeof p === 'string') {
        hit = f === p
        this.debug('string match', p, f, hit)
      } else {
        hit = f.match(p)
        this.debug('pattern match', p, f, hit)
      }

      if (!hit) return false
    }

    // Note: ending in / means that we'll get a final ""
    // at the end of the pattern.  This can only match a
    // corresponding "" at the end of the file.
    // If the file ends in /, then it can only match a
    // a pattern that ends in /, unless the pattern just
    // doesn't have any more for it. But, a/b/ should *not*
    // match "a/b/*", even though "" matches against the
    // [^/]*? pattern, except in partial mode, where it might
    // simply not be reached yet.
    // However, a/b/ should still satisfy a/*

    // now either we fell off the end of the pattern, or we're done.
    if (fi === fl && pi === pl) {
      // ran out of pattern and filename at the same time.
      // an exact hit!
      return true
    } else if (fi === fl) {
      // ran out of file, but still had pattern left.
      // this is ok if we're doing the match as part of
      // a glob fs traversal.
      return partial
    } else /* istanbul ignore else */ if (pi === pl) {
      // ran out of pattern, still have file left.
      // this is only acceptable if we're on the very last
      // empty segment of a file with a trailing slash.
      // a/* should match a/b/
      return (fi === fl - 1) && (file[fi] === '')
    }

    // should be unreachable.
    /* istanbul ignore next */
    throw new Error('wtf?')
  }

  braceExpand () {
    return braceExpand(this.pattern, this.options)
  }

  parse (pattern, isSub) {
    assertValidPattern(pattern)

    const options = this.options

    // shortcuts
    if (pattern === '**') {
      if (!options.noglobstar)
        return GLOBSTAR
      else
        pattern = '*'
    }
    if (pattern === '') return ''

    let re = ''
    let hasMagic = false
    let escaping = false
    // ? => one single character
    const patternListStack = []
    const negativeLists = []
    let stateChar
    let inClass = false
    let reClassStart = -1
    let classStart = -1
    let cs
    let pl
    let sp
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.  However, if the pattern
    // starts with ., then traversal patterns can match.
    let dotTravAllowed = pattern.charAt(0) === '.'
    let dotFileAllowed = options.dot || dotTravAllowed
    const patternStart = () =>
      dotTravAllowed
        ? ''
        : dotFileAllowed
        ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))'
        : '(?!\\.)'
    const subPatternStart = (p) =>
      p.charAt(0) === '.'
        ? ''
        : options.dot
        ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))'
        : '(?!\\.)'


    const clearStateChar = () => {
      if (stateChar) {
        // we had some state-tracking character
        // that wasn't consumed by this pass.
        switch (stateChar) {
          case '*':
            re += star
            hasMagic = true
          break
          case '?':
            re += qmark
            hasMagic = true
          break
          default:
            re += '\\' + stateChar
          break
        }
        this.debug('clearStateChar %j %j', stateChar, re)
        stateChar = false
      }
    }

    for (let i = 0, c; (i < pattern.length) && (c = pattern.charAt(i)); i++) {
      this.debug('%s\t%s %s %j', pattern, i, re, c)

      // skip over any that are escaped.
      if (escaping) {
        /* istanbul ignore next - completely not allowed, even escaped. */
        if (c === '/') {
          return false
        }

        if (reSpecials[c]) {
          re += '\\'
        }
        re += c
        escaping = false
        continue
      }

      switch (c) {
        /* istanbul ignore next */
        case '/': {
          // Should already be path-split by now.
          return false
        }

        case '\\':
          if (inClass && pattern.charAt(i + 1) === '-') {
            re += c
            continue
          }

          clearStateChar()
          escaping = true
        continue

        // the various stateChar values
        // for the "extglob" stuff.
        case '?':
        case '*':
        case '+':
        case '@':
        case '!':
          this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

          // all of those are literals inside a class, except that
          // the glob [!a] means [^a] in regexp
          if (inClass) {
            this.debug('  in class')
            if (c === '!' && i === classStart + 1) c = '^'
            re += c
            continue
          }

          // if we already have a stateChar, then it means
          // that there was something like ** or +? in there.
          // Handle the stateChar, then proceed with this one.
          this.debug('call clearStateChar %j', stateChar)
          clearStateChar()
          stateChar = c
          // if extglob is disabled, then +(asdf|foo) isn't a thing.
          // just clear the statechar *now*, rather than even diving into
          // the patternList stuff.
          if (options.noext) clearStateChar()
        continue

        case '(': {
          if (inClass) {
            re += '('
            continue
          }

          if (!stateChar) {
            re += '\\('
            continue
          }

          const plEntry = {
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close,
          }
          this.debug(this.pattern, '\t', plEntry)
          patternListStack.push(plEntry)
          // negation is (?:(?!(?:js)(?:<rest>))[^/]*)
          re += plEntry.open
          // next entry starts with a dot maybe?
          if (plEntry.start === 0 && plEntry.type !== '!') {
            dotTravAllowed = true
            re += subPatternStart(pattern.slice(i + 1))
          }
          this.debug('plType %j %j', stateChar, re)
          stateChar = false
          continue
        }

        case ')': {
          const plEntry = patternListStack[patternListStack.length - 1]
          if (inClass || !plEntry) {
            re += '\\)'
            continue
          }
          patternListStack.pop()

          // closing an extglob
          clearStateChar()
          hasMagic = true
          pl = plEntry
          // negation is (?:(?!js)[^/]*)
          // The others are (?:<pattern>)<type>
          re += pl.close
          if (pl.type === '!') {
            negativeLists.push(Object.assign(pl, { reEnd: re.length }))
          }
          continue
        }

        case '|': {
          const plEntry = patternListStack[patternListStack.length - 1]
          if (inClass || !plEntry) {
            re += '\\|'
            continue
          }

          clearStateChar()
          re += '|'
          // next subpattern can start with a dot?
          if (plEntry.start === 0 && plEntry.type !== '!') {
            dotTravAllowed = true
            re += subPatternStart(pattern.slice(i + 1))
          }
          continue
        }

        // these are mostly the same in regexp and glob
        case '[':
          // swallow any state-tracking char before the [
          clearStateChar()

          if (inClass) {
            re += '\\' + c
            continue
          }

          inClass = true
          classStart = i
          reClassStart = re.length
          re += c
        continue

        case ']':
          //  a right bracket shall lose its special
          //  meaning and represent itself in
          //  a bracket expression if it occurs
          //  first in the list.  -- POSIX.2 2.8.3.2
          if (i === classStart + 1 || !inClass) {
            re += '\\' + c
            continue
          }

          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + braExpEscape(charUnescape(cs)) + ']')
            // looks good, finish up the class.
            re += c
          } catch (er) {
            // out of order ranges in JS are errors, but in glob syntax,
            // they're just a range that matches nothing.
            re = re.substring(0, reClassStart) + '(?:$.)' // match nothing ever
          }
          hasMagic = true
          inClass = false
        continue

        default:
          // swallow any state char that wasn't consumed
          clearStateChar()

          if (reSpecials[c] && !(c === '^' && inClass)) {
            re += '\\'
          }

          re += c
          break

      } // switch
    } // for

    // handle the case where we left a class open.
    // "[abc" is valid, equivalent to "\[abc"
    if (inClass) {
      // split where the last [ was, and escape it
      // this is a huge pita.  We now have to re-walk
      // the contents of the would-be class to re-translate
      // any characters that were passed through as-is
      cs = pattern.slice(classStart + 1)
      sp = this.parse(cs, SUBPARSE)
      re = re.substring(0, reClassStart) + '\\[' + sp[0]
      hasMagic = hasMagic || sp[1]
    }

    // handle the case where we had a +( thing at the *end*
    // of the pattern.
    // each pattern list stack adds 3 chars, and we need to go through
    // and escape any | chars that were passed through as-is for the regexp.
    // Go through and escape them, taking care not to double-escape any
    // | chars that were already escaped.
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      let tail
      tail = re.slice(pl.reStart + pl.open.length)
      this.debug('setting tail', re, pl)
      // maybe some even number of \, then maybe 1 \, followed by a |
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_, $1, $2) => {
        /* istanbul ignore else - should already be done */
        if (!$2) {
          // the | isn't already escaped, so escape it.
          $2 = '\\'
        }

        // need to escape all those slashes *again*, without escaping the
        // one that we need for escaping the | character.  As it works out,
        // escaping an even number of slashes can be done by simply repeating
        // it exactly after itself.  That's why this trick works.
        //
        // I am sorry that you have to see this.
        return $1 + $1 + $2 + '|'
      })

      this.debug('tail=%j\n   %s', tail, tail, pl, re)
      const t = pl.type === '*' ? star
        : pl.type === '?' ? qmark
        : '\\' + pl.type

      hasMagic = true
      re = re.slice(0, pl.reStart) + t + '\\(' + tail
    }

    // handle trailing things that only matter at the very end.
    clearStateChar()
    if (escaping) {
      // trailing \\
      re += '\\\\'
    }

    // only need to apply the nodot start if the re starts with
    // something that could conceivably capture a dot
    const addPatternStart = addPatternStartSet[re.charAt(0)]

    // Hack to work around lack of negative lookbehind in JS
    // A pattern like: *.!(x).!(y|z) needs to ensure that a name
    // like 'a.xyz.yz' doesn't match.  So, the first negative
    // lookahead, has to look ALL the way ahead, to the end of
    // the pattern.
    for (let n = negativeLists.length - 1; n > -1; n--) {
      const nl = negativeLists[n]

      const nlBefore = re.slice(0, nl.reStart)
      const nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
      let nlAfter = re.slice(nl.reEnd)
      const nlLast = re.slice(nl.reEnd - 8, nl.reEnd) + nlAfter

      // Handle nested stuff like *(*.js|!(*.json)), where open parens
      // mean that we should *not* include the ) in the bit that is considered
      // "after" the negated section.
      const closeParensBefore = nlBefore.split(')').length
      const openParensBefore = nlBefore.split('(').length - closeParensBefore
      let cleanAfter = nlAfter
      for (let i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
      }
      nlAfter = cleanAfter

      const dollar = nlAfter === '' && isSub !== SUBPARSE ? '(?:$|\\/)' : ''

      re = nlBefore + nlFirst + nlAfter + dollar + nlLast
    }

    // if the re is not "" at this point, then we need to make sure
    // it doesn't match against an empty path part.
    // Otherwise a/* will match a/, which it should not.
    if (re !== '' && hasMagic) {
      re = '(?=.)' + re
    }

    if (addPatternStart) {
      re = patternStart() + re
    }

    // parsing just a piece of a larger pattern.
    if (isSub === SUBPARSE) {
      return [re, hasMagic]
    }

    // if it's nocase, and the lcase/uppercase don't match, it's magic
    if (options.nocase && !hasMagic) {
      hasMagic = pattern.toUpperCase() !== pattern.toLowerCase()
    }

    // skip the regexp for non-magical patterns
    // unescape anything in it, though, so that it'll be
    // an exact match against a file etc.
    if (!hasMagic) {
      return globUnescape(pattern)
    }

    const flags = options.nocase ? 'i' : ''
    try {
      return Object.assign(new RegExp('^' + re + '$', flags), {
        _glob: pattern,
        _src: re,
      })
    } catch (er) /* istanbul ignore next - should be impossible */ {
      // If it was an invalid regular expression, then it can't match
      // anything.  This trick looks for a character after the end of
      // the string, which is of course impossible, except in multi-line
      // mode, but it's not a /m regex.
      return new RegExp('$.')
    }
  }

  makeRe () {
    if (this.regexp || this.regexp === false) return this.regexp

    // at this point, this.set is a 2d array of partial
    // pattern strings, or "**".
    //
    // It's better to use .match().  This function shouldn't
    // be used, really, but it's pretty convenient sometimes,
    // when you just want to work with a regex.
    const set = this.set

    if (!set.length) {
      this.regexp = false
      return this.regexp
    }
    const options = this.options

    const twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot
    const flags = options.nocase ? 'i' : ''

    // coalesce globstars and regexpify non-globstar patterns
    // if it's the only item, then we just do one twoStar
    // if it's the first, and there are more, prepend (\/|twoStar\/)? to next
    // if it's the last, append (\/twoStar|) to previous
    // if it's in the middle, append (\/|\/twoStar\/) to previous
    // then filter out GLOBSTAR symbols
    let re = set.map(pattern => {
      pattern = pattern.map(p =>
        typeof p === 'string' ? regExpEscape(p)
        : p === GLOBSTAR ? GLOBSTAR
        : p._src
      ).reduce((set, p) => {
        if (!(set[set.length - 1] === GLOBSTAR && p === GLOBSTAR)) {
          set.push(p)
        }
        return set
      }, [])
      pattern.forEach((p, i) => {
        if (p !== GLOBSTAR || pattern[i-1] === GLOBSTAR) {
          return
        }
        if (i === 0) {
          if (pattern.length > 1) {
            pattern[i+1] = '(?:\\\/|' + twoStar + '\\\/)?' + pattern[i+1]
          } else {
            pattern[i] = twoStar
          }
        } else if (i === pattern.length - 1) {
          pattern[i-1] += '(?:\\\/|' + twoStar + ')?'
        } else {
          pattern[i-1] += '(?:\\\/|\\\/' + twoStar + '\\\/)' + pattern[i+1]
          pattern[i+1] = GLOBSTAR
        }
      })
      return pattern.filter(p => p !== GLOBSTAR).join('/')
    }).join('|')

    // must match entire pattern
    // ending in a * or ** will make it less strict.
    re = '^(?:' + re + ')$'

    // can match anything, as long as it's not this.
    if (this.negate) re = '^(?!' + re + ').*$'

    try {
      this.regexp = new RegExp(re, flags)
    } catch (ex) /* istanbul ignore next - should be impossible */ {
      this.regexp = false
    }
    return this.regexp
  }

  match (f, partial = this.partial) {
    this.debug('match', f, this.pattern)
    // short-circuit in the case of busted things.
    // comments, etc.
    if (this.comment) return false
    if (this.empty) return f === ''

    if (f === '/' && partial) return true

    const options = this.options

    // windows: need to use /, not \
    if (path.sep !== '/') {
      f = f.split(path.sep).join('/')
    }

    // treat the test path as a set of pathparts.
    f = f.split(slashSplit)
    this.debug(this.pattern, 'split', f)

    // just ONE of the pattern sets in this.set needs to match
    // in order for it to be valid.  If negating, then just one
    // match means that we have failed.
    // Either way, return on the first hit.

    const set = this.set
    this.debug(this.pattern, 'set', set)

    // Find the basename of the path by looking for the last non-empty segment
    let filename
    for (let i = f.length - 1; i >= 0; i--) {
      filename = f[i]
      if (filename) break
    }

    for (let i = 0; i < set.length; i++) {
      const pattern = set[i]
      let file = f
      if (options.matchBase && pattern.length === 1) {
        file = [filename]
      }
      const hit = this.matchOne(file, pattern, partial)
      if (hit) {
        if (options.flipNegate) return true
        return !this.negate
      }
    }

    // didn't get any hits.  this is success if it's a negative
    // pattern, failure otherwise.
    if (options.flipNegate) return false
    return this.negate
  }

  static defaults (def) {
    return minimatch.defaults(def).Minimatch
  }
}

minimatch.Minimatch = Minimatch


/***/ }),

/***/ 1867:
/***/ ((module, exports, __nccwpck_require__) => {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = __nccwpck_require__(4300)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 5147:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { EventEmitter } = __nccwpck_require__(2361)
const STREAM_DESTROYED = new Error('Stream was destroyed')
const PREMATURE_CLOSE = new Error('Premature close')

const queueTick = __nccwpck_require__(5322)
const FIFO = __nccwpck_require__(2958)

/* eslint-disable no-multi-spaces */

// 27 bits used total (4 from shared, 13 from read, and 10 from write)
const MAX = ((1 << 27) - 1)

// Shared state
const OPENING       = 0b0001
const PREDESTROYING = 0b0010
const DESTROYING    = 0b0100
const DESTROYED     = 0b1000

const NOT_OPENING = MAX ^ OPENING
const NOT_PREDESTROYING = MAX ^ PREDESTROYING

// Read state (4 bit offset from shared state)
const READ_ACTIVE           = 0b0000000000001 << 4
const READ_UPDATING         = 0b0000000000010 << 4
const READ_PRIMARY          = 0b0000000000100 << 4
const READ_QUEUED           = 0b0000000001000 << 4
const READ_RESUMED          = 0b0000000010000 << 4
const READ_PIPE_DRAINED     = 0b0000000100000 << 4
const READ_ENDING           = 0b0000001000000 << 4
const READ_EMIT_DATA        = 0b0000010000000 << 4
const READ_EMIT_READABLE    = 0b0000100000000 << 4
const READ_EMITTED_READABLE = 0b0001000000000 << 4
const READ_DONE             = 0b0010000000000 << 4
const READ_NEXT_TICK        = 0b0100000000000 << 4
const READ_NEEDS_PUSH       = 0b1000000000000 << 4

// Combined read state
const READ_FLOWING = READ_RESUMED | READ_PIPE_DRAINED
const READ_ACTIVE_AND_NEEDS_PUSH = READ_ACTIVE | READ_NEEDS_PUSH
const READ_PRIMARY_AND_ACTIVE = READ_PRIMARY | READ_ACTIVE
const READ_EMIT_READABLE_AND_QUEUED = READ_EMIT_READABLE | READ_QUEUED

const READ_NOT_ACTIVE             = MAX ^ READ_ACTIVE
const READ_NON_PRIMARY            = MAX ^ READ_PRIMARY
const READ_NON_PRIMARY_AND_PUSHED = MAX ^ (READ_PRIMARY | READ_NEEDS_PUSH)
const READ_PUSHED                 = MAX ^ READ_NEEDS_PUSH
const READ_PAUSED                 = MAX ^ READ_RESUMED
const READ_NOT_QUEUED             = MAX ^ (READ_QUEUED | READ_EMITTED_READABLE)
const READ_NOT_ENDING             = MAX ^ READ_ENDING
const READ_PIPE_NOT_DRAINED       = MAX ^ READ_FLOWING
const READ_NOT_NEXT_TICK          = MAX ^ READ_NEXT_TICK
const READ_NOT_UPDATING           = MAX ^ READ_UPDATING

// Write state (17 bit offset, 4 bit offset from shared state and 13 from read state)
const WRITE_ACTIVE     = 0b0000000001 << 17
const WRITE_UPDATING   = 0b0000000010 << 17
const WRITE_PRIMARY    = 0b0000000100 << 17
const WRITE_QUEUED     = 0b0000001000 << 17
const WRITE_UNDRAINED  = 0b0000010000 << 17
const WRITE_DONE       = 0b0000100000 << 17
const WRITE_EMIT_DRAIN = 0b0001000000 << 17
const WRITE_NEXT_TICK  = 0b0010000000 << 17
const WRITE_WRITING    = 0b0100000000 << 17
const WRITE_FINISHING  = 0b1000000000 << 17

const WRITE_NOT_ACTIVE    = MAX ^ (WRITE_ACTIVE | WRITE_WRITING)
const WRITE_NON_PRIMARY   = MAX ^ WRITE_PRIMARY
const WRITE_NOT_FINISHING = MAX ^ WRITE_FINISHING
const WRITE_DRAINED       = MAX ^ WRITE_UNDRAINED
const WRITE_NOT_QUEUED    = MAX ^ WRITE_QUEUED
const WRITE_NOT_NEXT_TICK = MAX ^ WRITE_NEXT_TICK
const WRITE_NOT_UPDATING  = MAX ^ WRITE_UPDATING

// Combined shared state
const ACTIVE = READ_ACTIVE | WRITE_ACTIVE
const NOT_ACTIVE = MAX ^ ACTIVE
const DONE = READ_DONE | WRITE_DONE
const DESTROY_STATUS = DESTROYING | DESTROYED | PREDESTROYING
const OPEN_STATUS = DESTROY_STATUS | OPENING
const AUTO_DESTROY = DESTROY_STATUS | DONE
const NON_PRIMARY = WRITE_NON_PRIMARY & READ_NON_PRIMARY
const ACTIVE_OR_TICKING = WRITE_NEXT_TICK | READ_NEXT_TICK
const TICKING = ACTIVE_OR_TICKING & NOT_ACTIVE
const IS_OPENING = OPEN_STATUS | TICKING

// Combined shared state and read state
const READ_PRIMARY_STATUS = OPEN_STATUS | READ_ENDING | READ_DONE
const READ_STATUS = OPEN_STATUS | READ_DONE | READ_QUEUED
const READ_ENDING_STATUS = OPEN_STATUS | READ_ENDING | READ_QUEUED
const READ_READABLE_STATUS = OPEN_STATUS | READ_EMIT_READABLE | READ_QUEUED | READ_EMITTED_READABLE
const SHOULD_NOT_READ = OPEN_STATUS | READ_ACTIVE | READ_ENDING | READ_DONE | READ_NEEDS_PUSH
const READ_BACKPRESSURE_STATUS = DESTROY_STATUS | READ_ENDING | READ_DONE
const READ_UPDATE_SYNC_STATUS = READ_UPDATING | OPEN_STATUS | READ_NEXT_TICK | READ_PRIMARY

// Combined write state
const WRITE_PRIMARY_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_DONE
const WRITE_QUEUED_AND_UNDRAINED = WRITE_QUEUED | WRITE_UNDRAINED
const WRITE_QUEUED_AND_ACTIVE = WRITE_QUEUED | WRITE_ACTIVE
const WRITE_DRAIN_STATUS = WRITE_QUEUED | WRITE_UNDRAINED | OPEN_STATUS | WRITE_ACTIVE
const WRITE_STATUS = OPEN_STATUS | WRITE_ACTIVE | WRITE_QUEUED
const WRITE_PRIMARY_AND_ACTIVE = WRITE_PRIMARY | WRITE_ACTIVE
const WRITE_ACTIVE_AND_WRITING = WRITE_ACTIVE | WRITE_WRITING
const WRITE_FINISHING_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_QUEUED_AND_ACTIVE | WRITE_DONE
const WRITE_BACKPRESSURE_STATUS = WRITE_UNDRAINED | DESTROY_STATUS | WRITE_FINISHING | WRITE_DONE
const WRITE_UPDATE_SYNC_STATUS = WRITE_UPDATING | OPEN_STATUS | WRITE_NEXT_TICK | WRITE_PRIMARY

const asyncIterator = Symbol.asyncIterator || Symbol('asyncIterator')

class WritableState {
  constructor (stream, { highWaterMark = 16384, map = null, mapWritable, byteLength, byteLengthWritable } = {}) {
    this.stream = stream
    this.queue = new FIFO()
    this.highWaterMark = highWaterMark
    this.buffered = 0
    this.error = null
    this.pipeline = null
    this.drains = null // if we add more seldomly used helpers we might them into a subobject so its a single ptr
    this.byteLength = byteLengthWritable || byteLength || defaultByteLength
    this.map = mapWritable || map
    this.afterWrite = afterWrite.bind(this)
    this.afterUpdateNextTick = updateWriteNT.bind(this)
  }

  get ended () {
    return (this.stream._duplexState & WRITE_DONE) !== 0
  }

  push (data) {
    if (this.map !== null) data = this.map(data)

    this.buffered += this.byteLength(data)
    this.queue.push(data)

    if (this.buffered < this.highWaterMark) {
      this.stream._duplexState |= WRITE_QUEUED
      return true
    }

    this.stream._duplexState |= WRITE_QUEUED_AND_UNDRAINED
    return false
  }

  shift () {
    const data = this.queue.shift()

    this.buffered -= this.byteLength(data)
    if (this.buffered === 0) this.stream._duplexState &= WRITE_NOT_QUEUED

    return data
  }

  end (data) {
    if (typeof data === 'function') this.stream.once('finish', data)
    else if (data !== undefined && data !== null) this.push(data)
    this.stream._duplexState = (this.stream._duplexState | WRITE_FINISHING) & WRITE_NON_PRIMARY
  }

  autoBatch (data, cb) {
    const buffer = []
    const stream = this.stream

    buffer.push(data)
    while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED_AND_ACTIVE) {
      buffer.push(stream._writableState.shift())
    }

    if ((stream._duplexState & OPEN_STATUS) !== 0) return cb(null)
    stream._writev(buffer, cb)
  }

  update () {
    const stream = this.stream

    stream._duplexState |= WRITE_UPDATING

    do {
      while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED) {
        const data = this.shift()
        stream._duplexState |= WRITE_ACTIVE_AND_WRITING
        stream._write(data, this.afterWrite)
      }

      if ((stream._duplexState & WRITE_PRIMARY_AND_ACTIVE) === 0) this.updateNonPrimary()
    } while (this.continueUpdate() === true)

    stream._duplexState &= WRITE_NOT_UPDATING
  }

  updateNonPrimary () {
    const stream = this.stream

    if ((stream._duplexState & WRITE_FINISHING_STATUS) === WRITE_FINISHING) {
      stream._duplexState = (stream._duplexState | WRITE_ACTIVE) & WRITE_NOT_FINISHING
      stream._final(afterFinal.bind(this))
      return
    }

    if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
      if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
        stream._duplexState |= ACTIVE
        stream._destroy(afterDestroy.bind(this))
      }
      return
    }

    if ((stream._duplexState & IS_OPENING) === OPENING) {
      stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING
      stream._open(afterOpen.bind(this))
    }
  }

  continueUpdate () {
    if ((this.stream._duplexState & WRITE_NEXT_TICK) === 0) return false
    this.stream._duplexState &= WRITE_NOT_NEXT_TICK
    return true
  }

  updateCallback () {
    if ((this.stream._duplexState & WRITE_UPDATE_SYNC_STATUS) === WRITE_PRIMARY) this.update()
    else this.updateNextTick()
  }

  updateNextTick () {
    if ((this.stream._duplexState & WRITE_NEXT_TICK) !== 0) return
    this.stream._duplexState |= WRITE_NEXT_TICK
    if ((this.stream._duplexState & WRITE_UPDATING) === 0) queueTick(this.afterUpdateNextTick)
  }
}

class ReadableState {
  constructor (stream, { highWaterMark = 16384, map = null, mapReadable, byteLength, byteLengthReadable } = {}) {
    this.stream = stream
    this.queue = new FIFO()
    this.highWaterMark = highWaterMark
    this.buffered = 0
    this.error = null
    this.pipeline = null
    this.byteLength = byteLengthReadable || byteLength || defaultByteLength
    this.map = mapReadable || map
    this.pipeTo = null
    this.afterRead = afterRead.bind(this)
    this.afterUpdateNextTick = updateReadNT.bind(this)
  }

  get ended () {
    return (this.stream._duplexState & READ_DONE) !== 0
  }

  pipe (pipeTo, cb) {
    if (this.pipeTo !== null) throw new Error('Can only pipe to one destination')
    if (typeof cb !== 'function') cb = null

    this.stream._duplexState |= READ_PIPE_DRAINED
    this.pipeTo = pipeTo
    this.pipeline = new Pipeline(this.stream, pipeTo, cb)

    if (cb) this.stream.on('error', noop) // We already error handle this so supress crashes

    if (isStreamx(pipeTo)) {
      pipeTo._writableState.pipeline = this.pipeline
      if (cb) pipeTo.on('error', noop) // We already error handle this so supress crashes
      pipeTo.on('finish', this.pipeline.finished.bind(this.pipeline)) // TODO: just call finished from pipeTo itself
    } else {
      const onerror = this.pipeline.done.bind(this.pipeline, pipeTo)
      const onclose = this.pipeline.done.bind(this.pipeline, pipeTo, null) // onclose has a weird bool arg
      pipeTo.on('error', onerror)
      pipeTo.on('close', onclose)
      pipeTo.on('finish', this.pipeline.finished.bind(this.pipeline))
    }

    pipeTo.on('drain', afterDrain.bind(this))
    this.stream.emit('piping', pipeTo)
    pipeTo.emit('pipe', this.stream)
  }

  push (data) {
    const stream = this.stream

    if (data === null) {
      this.highWaterMark = 0
      stream._duplexState = (stream._duplexState | READ_ENDING) & READ_NON_PRIMARY_AND_PUSHED
      return false
    }

    if (this.map !== null) data = this.map(data)
    this.buffered += this.byteLength(data)
    this.queue.push(data)

    stream._duplexState = (stream._duplexState | READ_QUEUED) & READ_PUSHED

    return this.buffered < this.highWaterMark
  }

  shift () {
    const data = this.queue.shift()

    this.buffered -= this.byteLength(data)
    if (this.buffered === 0) this.stream._duplexState &= READ_NOT_QUEUED
    return data
  }

  unshift (data) {
    const pending = [this.map !== null ? this.map(data) : data]
    while (this.buffered > 0) pending.push(this.shift())

    for (let i = 0; i < pending.length - 1; i++) {
      const data = pending[i]
      this.buffered += this.byteLength(data)
      this.queue.push(data)
    }

    this.push(pending[pending.length - 1])
  }

  read () {
    const stream = this.stream

    if ((stream._duplexState & READ_STATUS) === READ_QUEUED) {
      const data = this.shift()
      if (this.pipeTo !== null && this.pipeTo.write(data) === false) stream._duplexState &= READ_PIPE_NOT_DRAINED
      if ((stream._duplexState & READ_EMIT_DATA) !== 0) stream.emit('data', data)
      return data
    }

    return null
  }

  drain () {
    const stream = this.stream

    while ((stream._duplexState & READ_STATUS) === READ_QUEUED && (stream._duplexState & READ_FLOWING) !== 0) {
      const data = this.shift()
      if (this.pipeTo !== null && this.pipeTo.write(data) === false) stream._duplexState &= READ_PIPE_NOT_DRAINED
      if ((stream._duplexState & READ_EMIT_DATA) !== 0) stream.emit('data', data)
    }
  }

  update () {
    const stream = this.stream

    stream._duplexState |= READ_UPDATING

    do {
      this.drain()

      while (this.buffered < this.highWaterMark && (stream._duplexState & SHOULD_NOT_READ) === 0) {
        stream._duplexState |= READ_ACTIVE_AND_NEEDS_PUSH
        stream._read(this.afterRead)
        this.drain()
      }

      if ((stream._duplexState & READ_READABLE_STATUS) === READ_EMIT_READABLE_AND_QUEUED) {
        stream._duplexState |= READ_EMITTED_READABLE
        stream.emit('readable')
      }

      if ((stream._duplexState & READ_PRIMARY_AND_ACTIVE) === 0) this.updateNonPrimary()
    } while (this.continueUpdate() === true)

    stream._duplexState &= READ_NOT_UPDATING
  }

  updateNonPrimary () {
    const stream = this.stream

    if ((stream._duplexState & READ_ENDING_STATUS) === READ_ENDING) {
      stream._duplexState = (stream._duplexState | READ_DONE) & READ_NOT_ENDING
      stream.emit('end')
      if ((stream._duplexState & AUTO_DESTROY) === DONE) stream._duplexState |= DESTROYING
      if (this.pipeTo !== null) this.pipeTo.end()
    }

    if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
      if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
        stream._duplexState |= ACTIVE
        stream._destroy(afterDestroy.bind(this))
      }
      return
    }

    if ((stream._duplexState & IS_OPENING) === OPENING) {
      stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING
      stream._open(afterOpen.bind(this))
    }
  }

  continueUpdate () {
    if ((this.stream._duplexState & READ_NEXT_TICK) === 0) return false
    this.stream._duplexState &= READ_NOT_NEXT_TICK
    return true
  }

  updateCallback () {
    if ((this.stream._duplexState & READ_UPDATE_SYNC_STATUS) === READ_PRIMARY) this.update()
    else this.updateNextTick()
  }

  updateNextTick () {
    if ((this.stream._duplexState & READ_NEXT_TICK) !== 0) return
    this.stream._duplexState |= READ_NEXT_TICK
    if ((this.stream._duplexState & READ_UPDATING) === 0) queueTick(this.afterUpdateNextTick)
  }
}

class TransformState {
  constructor (stream) {
    this.data = null
    this.afterTransform = afterTransform.bind(stream)
    this.afterFinal = null
  }
}

class Pipeline {
  constructor (src, dst, cb) {
    this.from = src
    this.to = dst
    this.afterPipe = cb
    this.error = null
    this.pipeToFinished = false
  }

  finished () {
    this.pipeToFinished = true
  }

  done (stream, err) {
    if (err) this.error = err

    if (stream === this.to) {
      this.to = null

      if (this.from !== null) {
        if ((this.from._duplexState & READ_DONE) === 0 || !this.pipeToFinished) {
          this.from.destroy(this.error || new Error('Writable stream closed prematurely'))
        }
        return
      }
    }

    if (stream === this.from) {
      this.from = null

      if (this.to !== null) {
        if ((stream._duplexState & READ_DONE) === 0) {
          this.to.destroy(this.error || new Error('Readable stream closed before ending'))
        }
        return
      }
    }

    if (this.afterPipe !== null) this.afterPipe(this.error)
    this.to = this.from = this.afterPipe = null
  }
}

function afterDrain () {
  this.stream._duplexState |= READ_PIPE_DRAINED
  this.updateCallback()
}

function afterFinal (err) {
  const stream = this.stream
  if (err) stream.destroy(err)
  if ((stream._duplexState & DESTROY_STATUS) === 0) {
    stream._duplexState |= WRITE_DONE
    stream.emit('finish')
  }
  if ((stream._duplexState & AUTO_DESTROY) === DONE) {
    stream._duplexState |= DESTROYING
  }

  stream._duplexState &= WRITE_NOT_ACTIVE

  // no need to wait the extra tick here, so we short circuit that
  if ((stream._duplexState & WRITE_UPDATING) === 0) this.update()
  else this.updateNextTick()
}

function afterDestroy (err) {
  const stream = this.stream

  if (!err && this.error !== STREAM_DESTROYED) err = this.error
  if (err) stream.emit('error', err)
  stream._duplexState |= DESTROYED
  stream.emit('close')

  const rs = stream._readableState
  const ws = stream._writableState

  if (rs !== null && rs.pipeline !== null) rs.pipeline.done(stream, err)

  if (ws !== null) {
    while (ws.drains !== null && ws.drains.length > 0) ws.drains.shift().resolve(false)
    if (ws.pipeline !== null) ws.pipeline.done(stream, err)
  }
}

function afterWrite (err) {
  const stream = this.stream

  if (err) stream.destroy(err)
  stream._duplexState &= WRITE_NOT_ACTIVE

  if (this.drains !== null) tickDrains(this.drains)

  if ((stream._duplexState & WRITE_DRAIN_STATUS) === WRITE_UNDRAINED) {
    stream._duplexState &= WRITE_DRAINED
    if ((stream._duplexState & WRITE_EMIT_DRAIN) === WRITE_EMIT_DRAIN) {
      stream.emit('drain')
    }
  }

  this.updateCallback()
}

function afterRead (err) {
  if (err) this.stream.destroy(err)
  this.stream._duplexState &= READ_NOT_ACTIVE
  this.updateCallback()
}

function updateReadNT () {
  if ((this.stream._duplexState & READ_UPDATING) === 0) {
    this.stream._duplexState &= READ_NOT_NEXT_TICK
    this.update()
  }
}

function updateWriteNT () {
  if ((this.stream._duplexState & WRITE_UPDATING) === 0) {
    this.stream._duplexState &= WRITE_NOT_NEXT_TICK
    this.update()
  }
}

function tickDrains (drains) {
  for (let i = 0; i < drains.length; i++) {
    // drains.writes are monotonic, so if one is 0 its always the first one
    if (--drains[i].writes === 0) {
      drains.shift().resolve(true)
      i--
    }
  }
}

function afterOpen (err) {
  const stream = this.stream

  if (err) stream.destroy(err)

  if ((stream._duplexState & DESTROYING) === 0) {
    if ((stream._duplexState & READ_PRIMARY_STATUS) === 0) stream._duplexState |= READ_PRIMARY
    if ((stream._duplexState & WRITE_PRIMARY_STATUS) === 0) stream._duplexState |= WRITE_PRIMARY
    stream.emit('open')
  }

  stream._duplexState &= NOT_ACTIVE

  if (stream._writableState !== null) {
    stream._writableState.updateCallback()
  }

  if (stream._readableState !== null) {
    stream._readableState.updateCallback()
  }
}

function afterTransform (err, data) {
  if (data !== undefined && data !== null) this.push(data)
  this._writableState.afterWrite(err)
}

class Stream extends EventEmitter {
  constructor (opts) {
    super()

    this._duplexState = 0
    this._readableState = null
    this._writableState = null

    if (opts) {
      if (opts.open) this._open = opts.open
      if (opts.destroy) this._destroy = opts.destroy
      if (opts.predestroy) this._predestroy = opts.predestroy
      if (opts.signal) {
        opts.signal.addEventListener('abort', abort.bind(this))
      }
    }
  }

  _open (cb) {
    cb(null)
  }

  _destroy (cb) {
    cb(null)
  }

  _predestroy () {
    // does nothing
  }

  get readable () {
    return this._readableState !== null ? true : undefined
  }

  get writable () {
    return this._writableState !== null ? true : undefined
  }

  get destroyed () {
    return (this._duplexState & DESTROYED) !== 0
  }

  get destroying () {
    return (this._duplexState & DESTROY_STATUS) !== 0
  }

  destroy (err) {
    if ((this._duplexState & DESTROY_STATUS) === 0) {
      if (!err) err = STREAM_DESTROYED
      this._duplexState = (this._duplexState | DESTROYING) & NON_PRIMARY

      if (this._readableState !== null) {
        this._readableState.highWaterMark = 0
        this._readableState.error = err
      }
      if (this._writableState !== null) {
        this._writableState.highWaterMark = 0
        this._writableState.error = err
      }

      this._duplexState |= PREDESTROYING
      this._predestroy()
      this._duplexState &= NOT_PREDESTROYING

      if (this._readableState !== null) this._readableState.updateNextTick()
      if (this._writableState !== null) this._writableState.updateNextTick()
    }
  }

  on (name, fn) {
    if (this._readableState !== null) {
      if (name === 'data') {
        this._duplexState |= (READ_EMIT_DATA | READ_RESUMED)
        this._readableState.updateNextTick()
      }
      if (name === 'readable') {
        this._duplexState |= READ_EMIT_READABLE
        this._readableState.updateNextTick()
      }
    }

    if (this._writableState !== null) {
      if (name === 'drain') {
        this._duplexState |= WRITE_EMIT_DRAIN
        this._writableState.updateNextTick()
      }
    }

    return super.on(name, fn)
  }
}

class Readable extends Stream {
  constructor (opts) {
    super(opts)

    this._duplexState |= OPENING | WRITE_DONE
    this._readableState = new ReadableState(this, opts)

    if (opts) {
      if (opts.read) this._read = opts.read
      if (opts.eagerOpen) this._readableState.updateNextTick()
    }
  }

  _read (cb) {
    cb(null)
  }

  pipe (dest, cb) {
    this._readableState.updateNextTick()
    this._readableState.pipe(dest, cb)
    return dest
  }

  read () {
    this._readableState.updateNextTick()
    return this._readableState.read()
  }

  push (data) {
    this._readableState.updateNextTick()
    return this._readableState.push(data)
  }

  unshift (data) {
    this._readableState.updateNextTick()
    return this._readableState.unshift(data)
  }

  resume () {
    this._duplexState |= READ_RESUMED
    this._readableState.updateNextTick()
    return this
  }

  pause () {
    this._duplexState &= READ_PAUSED
    return this
  }

  static _fromAsyncIterator (ite, opts) {
    let destroy

    const rs = new Readable({
      ...opts,
      read (cb) {
        ite.next().then(push).then(cb.bind(null, null)).catch(cb)
      },
      predestroy () {
        destroy = ite.return()
      },
      destroy (cb) {
        if (!destroy) return cb(null)
        destroy.then(cb.bind(null, null)).catch(cb)
      }
    })

    return rs

    function push (data) {
      if (data.done) rs.push(null)
      else rs.push(data.value)
    }
  }

  static from (data, opts) {
    if (isReadStreamx(data)) return data
    if (data[asyncIterator]) return this._fromAsyncIterator(data[asyncIterator](), opts)
    if (!Array.isArray(data)) data = data === undefined ? [] : [data]

    let i = 0
    return new Readable({
      ...opts,
      read (cb) {
        this.push(i === data.length ? null : data[i++])
        cb(null)
      }
    })
  }

  static isBackpressured (rs) {
    return (rs._duplexState & READ_BACKPRESSURE_STATUS) !== 0 || rs._readableState.buffered >= rs._readableState.highWaterMark
  }

  static isPaused (rs) {
    return (rs._duplexState & READ_RESUMED) === 0
  }

  [asyncIterator] () {
    const stream = this

    let error = null
    let promiseResolve = null
    let promiseReject = null

    this.on('error', (err) => { error = err })
    this.on('readable', onreadable)
    this.on('close', onclose)

    return {
      [asyncIterator] () {
        return this
      },
      next () {
        return new Promise(function (resolve, reject) {
          promiseResolve = resolve
          promiseReject = reject
          const data = stream.read()
          if (data !== null) ondata(data)
          else if ((stream._duplexState & DESTROYED) !== 0) ondata(null)
        })
      },
      return () {
        return destroy(null)
      },
      throw (err) {
        return destroy(err)
      }
    }

    function onreadable () {
      if (promiseResolve !== null) ondata(stream.read())
    }

    function onclose () {
      if (promiseResolve !== null) ondata(null)
    }

    function ondata (data) {
      if (promiseReject === null) return
      if (error) promiseReject(error)
      else if (data === null && (stream._duplexState & READ_DONE) === 0) promiseReject(STREAM_DESTROYED)
      else promiseResolve({ value: data, done: data === null })
      promiseReject = promiseResolve = null
    }

    function destroy (err) {
      stream.destroy(err)
      return new Promise((resolve, reject) => {
        if (stream._duplexState & DESTROYED) return resolve({ value: undefined, done: true })
        stream.once('close', function () {
          if (err) reject(err)
          else resolve({ value: undefined, done: true })
        })
      })
    }
  }
}

class Writable extends Stream {
  constructor (opts) {
    super(opts)

    this._duplexState |= OPENING | READ_DONE
    this._writableState = new WritableState(this, opts)

    if (opts) {
      if (opts.writev) this._writev = opts.writev
      if (opts.write) this._write = opts.write
      if (opts.final) this._final = opts.final
      if (opts.eagerOpen) this._writableState.updateNextTick()
    }
  }

  _writev (batch, cb) {
    cb(null)
  }

  _write (data, cb) {
    this._writableState.autoBatch(data, cb)
  }

  _final (cb) {
    cb(null)
  }

  static isBackpressured (ws) {
    return (ws._duplexState & WRITE_BACKPRESSURE_STATUS) !== 0
  }

  static drained (ws) {
    if (ws.destroyed) return Promise.resolve(false)
    const state = ws._writableState
    const pending = (isWritev(ws) ? Math.min(1, state.queue.length) : state.queue.length)
    const writes = pending + ((ws._duplexState & WRITE_WRITING) ? 1 : 0)
    if (writes === 0) return Promise.resolve(true)
    if (state.drains === null) state.drains = []
    return new Promise((resolve) => {
      state.drains.push({ writes, resolve })
    })
  }

  write (data) {
    this._writableState.updateNextTick()
    return this._writableState.push(data)
  }

  end (data) {
    this._writableState.updateNextTick()
    this._writableState.end(data)
    return this
  }
}

class Duplex extends Readable { // and Writable
  constructor (opts) {
    super(opts)

    this._duplexState = OPENING
    this._writableState = new WritableState(this, opts)

    if (opts) {
      if (opts.writev) this._writev = opts.writev
      if (opts.write) this._write = opts.write
      if (opts.final) this._final = opts.final
    }
  }

  _writev (batch, cb) {
    cb(null)
  }

  _write (data, cb) {
    this._writableState.autoBatch(data, cb)
  }

  _final (cb) {
    cb(null)
  }

  write (data) {
    this._writableState.updateNextTick()
    return this._writableState.push(data)
  }

  end (data) {
    this._writableState.updateNextTick()
    this._writableState.end(data)
    return this
  }
}

class Transform extends Duplex {
  constructor (opts) {
    super(opts)
    this._transformState = new TransformState(this)

    if (opts) {
      if (opts.transform) this._transform = opts.transform
      if (opts.flush) this._flush = opts.flush
    }
  }

  _write (data, cb) {
    if (this._readableState.buffered >= this._readableState.highWaterMark) {
      this._transformState.data = data
    } else {
      this._transform(data, this._transformState.afterTransform)
    }
  }

  _read (cb) {
    if (this._transformState.data !== null) {
      const data = this._transformState.data
      this._transformState.data = null
      cb(null)
      this._transform(data, this._transformState.afterTransform)
    } else {
      cb(null)
    }
  }

  destroy (err) {
    super.destroy(err)
    if (this._transformState.data !== null) {
      this._transformState.data = null
      this._transformState.afterTransform()
    }
  }

  _transform (data, cb) {
    cb(null, data)
  }

  _flush (cb) {
    cb(null)
  }

  _final (cb) {
    this._transformState.afterFinal = cb
    this._flush(transformAfterFlush.bind(this))
  }
}

class PassThrough extends Transform {}

function transformAfterFlush (err, data) {
  const cb = this._transformState.afterFinal
  if (err) return cb(err)
  if (data !== null && data !== undefined) this.push(data)
  this.push(null)
  cb(null)
}

function pipelinePromise (...streams) {
  return new Promise((resolve, reject) => {
    return pipeline(...streams, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function pipeline (stream, ...streams) {
  const all = Array.isArray(stream) ? [...stream, ...streams] : [stream, ...streams]
  const done = (all.length && typeof all[all.length - 1] === 'function') ? all.pop() : null

  if (all.length < 2) throw new Error('Pipeline requires at least 2 streams')

  let src = all[0]
  let dest = null
  let error = null

  for (let i = 1; i < all.length; i++) {
    dest = all[i]

    if (isStreamx(src)) {
      src.pipe(dest, onerror)
    } else {
      errorHandle(src, true, i > 1, onerror)
      src.pipe(dest)
    }

    src = dest
  }

  if (done) {
    let fin = false

    const autoDestroy = isStreamx(dest) || !!(dest._writableState && dest._writableState.autoDestroy)

    dest.on('error', (err) => {
      if (error === null) error = err
    })

    dest.on('finish', () => {
      fin = true
      if (!autoDestroy) done(error)
    })

    if (autoDestroy) {
      dest.on('close', () => done(error || (fin ? null : PREMATURE_CLOSE)))
    }
  }

  return dest

  function errorHandle (s, rd, wr, onerror) {
    s.on('error', onerror)
    s.on('close', onclose)

    function onclose () {
      if (rd && s._readableState && !s._readableState.ended) return onerror(PREMATURE_CLOSE)
      if (wr && s._writableState && !s._writableState.ended) return onerror(PREMATURE_CLOSE)
    }
  }

  function onerror (err) {
    if (!err || error) return
    error = err

    for (const s of all) {
      s.destroy(err)
    }
  }
}

function isStream (stream) {
  return !!stream._readableState || !!stream._writableState
}

function isStreamx (stream) {
  return typeof stream._duplexState === 'number' && isStream(stream)
}

function getStreamError (stream) {
  const err = (stream._readableState && stream._readableState.error) || (stream._writableState && stream._writableState.error)
  return err === STREAM_DESTROYED ? null : err // only explicit errors
}

function isReadStreamx (stream) {
  return isStreamx(stream) && stream.readable
}

function isTypedArray (data) {
  return typeof data === 'object' && data !== null && typeof data.byteLength === 'number'
}

function defaultByteLength (data) {
  return isTypedArray(data) ? data.byteLength : 1024
}

function noop () {}

function abort () {
  this.destroy(new Error('Stream aborted.'))
}

function isWritev (s) {
  return s._writev !== Writable.prototype._writev && s._writev !== Duplex.prototype._writev
}

module.exports = {
  pipeline,
  pipelinePromise,
  isStream,
  isStreamx,
  getStreamError,
  Stream,
  Writable,
  Readable,
  Duplex,
  Transform,
  // Export PassThrough for compatibility with Node.js core's stream module
  PassThrough
}


/***/ }),

/***/ 4841:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var Buffer = (__nccwpck_require__(1867).Buffer);
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.s = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ 8926:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const constants = { // just for envs without fs
  S_IFMT: 61440,
  S_IFDIR: 16384,
  S_IFCHR: 8192,
  S_IFBLK: 24576,
  S_IFIFO: 4096,
  S_IFLNK: 40960
}

try {
  module.exports = (__nccwpck_require__(7147).constants) || constants
} catch {
  module.exports = constants
}


/***/ }),

/***/ 2931:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Writable, Readable, getStreamError } = __nccwpck_require__(5147)
const FIFO = __nccwpck_require__(2958)
const b4a = __nccwpck_require__(3497)
const headers = __nccwpck_require__(8860)

const EMPTY = b4a.alloc(0)

class BufferList {
  constructor () {
    this.buffered = 0
    this.shifted = 0
    this.queue = new FIFO()

    this._offset = 0
  }

  push (buffer) {
    this.buffered += buffer.byteLength
    this.queue.push(buffer)
  }

  shiftFirst (size) {
    return this._buffered === 0 ? null : this._next(size)
  }

  shift (size) {
    if (size > this.buffered) return null
    if (size === 0) return EMPTY

    let chunk = this._next(size)

    if (size === chunk.byteLength) return chunk // likely case

    const chunks = [chunk]

    while ((size -= chunk.byteLength) > 0) {
      chunk = this._next(size)
      chunks.push(chunk)
    }

    return b4a.concat(chunks)
  }

  _next (size) {
    const buf = this.queue.peek()
    const rem = buf.byteLength - this._offset

    if (size >= rem) {
      const sub = this._offset ? buf.subarray(this._offset, buf.byteLength) : buf
      this.queue.shift()
      this._offset = 0
      this.buffered -= rem
      this.shifted += rem
      return sub
    }

    this.buffered -= size
    this.shifted += size

    return buf.subarray(this._offset, (this._offset += size))
  }
}

class Source extends Readable {
  constructor (self, header, offset) {
    super()

    this.header = header
    this.offset = offset

    this._parent = self
  }

  _read (cb) {
    if (this.header.size === 0) {
      this.push(null)
    }
    if (this._parent._stream === this) {
      this._parent._update()
    }
    cb(null)
  }

  _predestroy () {
    this._parent.destroy(getStreamError(this))
  }

  _detach () {
    if (this._parent._stream === this) {
      this._parent._stream = null
      this._parent._missing = overflow(this.header.size)
      this._parent._update()
    }
  }

  _destroy (cb) {
    this._detach()
    cb(null)
  }
}

class Extract extends Writable {
  constructor (opts) {
    super(opts)

    if (!opts) opts = {}

    this._buffer = new BufferList()
    this._offset = 0
    this._header = null
    this._stream = null
    this._missing = 0
    this._longHeader = false
    this._callback = noop
    this._locked = false
    this._finished = false
    this._pax = null
    this._paxGlobal = null
    this._gnuLongPath = null
    this._gnuLongLinkPath = null
    this._filenameEncoding = opts.filenameEncoding || 'utf-8'
    this._allowUnknownFormat = !!opts.allowUnknownFormat
    this._unlockBound = this._unlock.bind(this)
  }

  _unlock (err) {
    this._locked = false

    if (err) {
      this.destroy(err)
      this._continueWrite(err)
      return
    }

    this._update()
  }

  _consumeHeader () {
    if (this._locked) return false

    this._offset = this._buffer.shifted

    try {
      this._header = headers.decode(this._buffer.shift(512), this._filenameEncoding, this._allowUnknownFormat)
    } catch (err) {
      this._continueWrite(err)
      return false
    }

    if (!this._header) return true

    switch (this._header.type) {
      case 'gnu-long-path':
      case 'gnu-long-link-path':
      case 'pax-global-header':
      case 'pax-header':
        this._longHeader = true
        this._missing = this._header.size
        return true
    }

    this._locked = true
    this._applyLongHeaders()

    if (this._header.size === 0 || this._header.type === 'directory') {
      this.emit('entry', this._header, this._createStream(), this._unlockBound)
      return true
    }

    this._stream = this._createStream()
    this._missing = this._header.size

    this.emit('entry', this._header, this._stream, this._unlockBound)
    return true
  }

  _applyLongHeaders () {
    if (this._gnuLongPath) {
      this._header.name = this._gnuLongPath
      this._gnuLongPath = null
    }

    if (this._gnuLongLinkPath) {
      this._header.linkname = this._gnuLongLinkPath
      this._gnuLongLinkPath = null
    }

    if (this._pax) {
      if (this._pax.path) this._header.name = this._pax.path
      if (this._pax.linkpath) this._header.linkname = this._pax.linkpath
      if (this._pax.size) this._header.size = parseInt(this._pax.size, 10)
      this._header.pax = this._pax
      this._pax = null
    }
  }

  _decodeLongHeader (buf) {
    switch (this._header.type) {
      case 'gnu-long-path':
        this._gnuLongPath = headers.decodeLongPath(buf, this._filenameEncoding)
        break
      case 'gnu-long-link-path':
        this._gnuLongLinkPath = headers.decodeLongPath(buf, this._filenameEncoding)
        break
      case 'pax-global-header':
        this._paxGlobal = headers.decodePax(buf)
        break
      case 'pax-header':
        this._pax = this._paxGlobal === null
          ? headers.decodePax(buf)
          : Object.assign({}, this._paxGlobal, headers.decodePax(buf))
        break
    }
  }

  _consumeLongHeader () {
    this._longHeader = false
    this._missing = overflow(this._header.size)

    const buf = this._buffer.shift(this._header.size)

    try {
      this._decodeLongHeader(buf)
    } catch (err) {
      this._continueWrite(err)
      return false
    }

    return true
  }

  _consumeStream () {
    const buf = this._buffer.shiftFirst(this._missing)
    if (buf === null) return false

    this._missing -= buf.byteLength
    const drained = this._stream.push(buf)

    if (this._missing === 0) {
      this._stream.push(null)
      if (drained) this._stream._detach()
      return drained && this._locked === false
    }

    return drained
  }

  _createStream () {
    return new Source(this, this._header, this._offset)
  }

  _update () {
    while (this._buffer.buffered > 0 && !this.destroying) {
      if (this._missing > 0) {
        if (this._stream !== null) {
          if (this._consumeStream() === false) return
          continue
        }

        if (this._longHeader === true) {
          if (this._missing > this._buffer.buffered) break
          if (this._consumeLongHeader() === false) return false
          continue
        }

        const ignore = this._buffer.shiftFirst(this._missing)
        if (ignore !== null) this._missing -= ignore.byteLength
        continue
      }

      if (this._buffer.buffered < 512) break
      if (this._stream !== null || this._consumeHeader() === false) return
    }

    this._continueWrite(null)
  }

  _continueWrite (err) {
    const cb = this._callback
    this._callback = noop
    cb(err)
  }

  _write (data, cb) {
    this._callback = cb
    this._buffer.push(data)
    this._update()
  }

  _final (cb) {
    this._finished = this._missing === 0 && this._buffer.buffered === 0
    cb(this._finished ? null : new Error('Unexpected end of data'))
  }

  _predestroy () {
    this._continueWrite(null)
  }

  _destroy (cb) {
    if (this._stream) this._stream.destroy(getStreamError(this))
    cb(null)
  }

  [Symbol.asyncIterator] () {
    let error = null

    let promiseResolve = null
    let promiseReject = null

    let entryStream = null
    let entryCallback = null

    const extract = this

    this.on('entry', onentry)
    this.on('error', (err) => { error = err })
    this.on('close', onclose)

    return {
      [Symbol.asyncIterator] () {
        return this
      },
      next () {
        return new Promise(onnext)
      },
      return () {
        return destroy(null)
      },
      throw (err) {
        return destroy(err)
      }
    }

    function consumeCallback (err) {
      if (!entryCallback) return
      const cb = entryCallback
      entryCallback = null
      cb(err)
    }

    function onnext (resolve, reject) {
      if (error) {
        return reject(error)
      }

      if (entryStream) {
        resolve({ value: entryStream, done: false })
        entryStream = null
        return
      }

      promiseResolve = resolve
      promiseReject = reject

      consumeCallback(null)

      if (extract._finished && promiseResolve) {
        promiseResolve({ value: undefined, done: true })
        promiseResolve = promiseReject = null
      }
    }

    function onentry (header, stream, callback) {
      entryCallback = callback
      stream.on('error', noop) // no way around this due to tick sillyness

      if (promiseResolve) {
        promiseResolve({ value: stream, done: false })
        promiseResolve = promiseReject = null
      } else {
        entryStream = stream
      }
    }

    function onclose () {
      consumeCallback(error)
      if (!promiseResolve) return
      if (error) promiseReject(error)
      else promiseResolve({ value: undefined, done: true })
      promiseResolve = promiseReject = null
    }

    function destroy (err) {
      extract.destroy(err)
      consumeCallback(err)
      return new Promise((resolve, reject) => {
        if (extract.destroyed) return resolve({ value: undefined, done: true })
        extract.once('close', function () {
          if (err) reject(err)
          else resolve({ value: undefined, done: true })
        })
      })
    }
  }
}

module.exports = function extract (opts) {
  return new Extract(opts)
}

function noop () {}

function overflow (size) {
  size &= 511
  return size && 512 - size
}


/***/ }),

/***/ 8860:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const b4a = __nccwpck_require__(3497)

const ZEROS = '0000000000000000000'
const SEVENS = '7777777777777777777'
const ZERO_OFFSET = '0'.charCodeAt(0)
const USTAR_MAGIC = b4a.from([0x75, 0x73, 0x74, 0x61, 0x72, 0x00]) // ustar\x00
const USTAR_VER = b4a.from([ZERO_OFFSET, ZERO_OFFSET])
const GNU_MAGIC = b4a.from([0x75, 0x73, 0x74, 0x61, 0x72, 0x20]) // ustar\x20
const GNU_VER = b4a.from([0x20, 0x00])
const MASK = 0o7777
const MAGIC_OFFSET = 257
const VERSION_OFFSET = 263

exports.decodeLongPath = function decodeLongPath (buf, encoding) {
  return decodeStr(buf, 0, buf.length, encoding)
}

exports.encodePax = function encodePax (opts) { // TODO: encode more stuff in pax
  let result = ''
  if (opts.name) result += addLength(' path=' + opts.name + '\n')
  if (opts.linkname) result += addLength(' linkpath=' + opts.linkname + '\n')
  const pax = opts.pax
  if (pax) {
    for (const key in pax) {
      result += addLength(' ' + key + '=' + pax[key] + '\n')
    }
  }
  return b4a.from(result)
}

exports.decodePax = function decodePax (buf) {
  const result = {}

  while (buf.length) {
    let i = 0
    while (i < buf.length && buf[i] !== 32) i++
    const len = parseInt(buf.subarray(0, i).toString(), 10)
    if (!len) return result

    const b = b4a.toString(buf.subarray(i + 1, len - 1))
    const keyIndex = b.indexOf('=')
    if (keyIndex === -1) return result
    result[b.slice(0, keyIndex)] = b.slice(keyIndex + 1)

    buf = buf.subarray(len)
  }

  return result
}

exports.encode = function encode (opts) {
  const buf = b4a.alloc(512)
  let name = opts.name
  let prefix = ''

  if (opts.typeflag === 5 && name[name.length - 1] !== '/') name += '/'
  if (b4a.byteLength(name) !== name.length) return null // utf-8

  while (b4a.byteLength(name) > 100) {
    const i = name.indexOf('/')
    if (i === -1) return null
    prefix += prefix ? '/' + name.slice(0, i) : name.slice(0, i)
    name = name.slice(i + 1)
  }

  if (b4a.byteLength(name) > 100 || b4a.byteLength(prefix) > 155) return null
  if (opts.linkname && b4a.byteLength(opts.linkname) > 100) return null

  b4a.write(buf, name)
  b4a.write(buf, encodeOct(opts.mode & MASK, 6), 100)
  b4a.write(buf, encodeOct(opts.uid, 6), 108)
  b4a.write(buf, encodeOct(opts.gid, 6), 116)
  encodeSize(opts.size, buf, 124)
  b4a.write(buf, encodeOct((opts.mtime.getTime() / 1000) | 0, 11), 136)

  buf[156] = ZERO_OFFSET + toTypeflag(opts.type)

  if (opts.linkname) b4a.write(buf, opts.linkname, 157)

  b4a.copy(USTAR_MAGIC, buf, MAGIC_OFFSET)
  b4a.copy(USTAR_VER, buf, VERSION_OFFSET)
  if (opts.uname) b4a.write(buf, opts.uname, 265)
  if (opts.gname) b4a.write(buf, opts.gname, 297)
  b4a.write(buf, encodeOct(opts.devmajor || 0, 6), 329)
  b4a.write(buf, encodeOct(opts.devminor || 0, 6), 337)

  if (prefix) b4a.write(buf, prefix, 345)

  b4a.write(buf, encodeOct(cksum(buf), 6), 148)

  return buf
}

exports.decode = function decode (buf, filenameEncoding, allowUnknownFormat) {
  let typeflag = buf[156] === 0 ? 0 : buf[156] - ZERO_OFFSET

  let name = decodeStr(buf, 0, 100, filenameEncoding)
  const mode = decodeOct(buf, 100, 8)
  const uid = decodeOct(buf, 108, 8)
  const gid = decodeOct(buf, 116, 8)
  const size = decodeOct(buf, 124, 12)
  const mtime = decodeOct(buf, 136, 12)
  const type = toType(typeflag)
  const linkname = buf[157] === 0 ? null : decodeStr(buf, 157, 100, filenameEncoding)
  const uname = decodeStr(buf, 265, 32)
  const gname = decodeStr(buf, 297, 32)
  const devmajor = decodeOct(buf, 329, 8)
  const devminor = decodeOct(buf, 337, 8)

  const c = cksum(buf)

  // checksum is still initial value if header was null.
  if (c === 8 * 32) return null

  // valid checksum
  if (c !== decodeOct(buf, 148, 8)) throw new Error('Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?')

  if (isUSTAR(buf)) {
    // ustar (posix) format.
    // prepend prefix, if present.
    if (buf[345]) name = decodeStr(buf, 345, 155, filenameEncoding) + '/' + name
  } else if (isGNU(buf)) {
    // 'gnu'/'oldgnu' format. Similar to ustar, but has support for incremental and
    // multi-volume tarballs.
  } else {
    if (!allowUnknownFormat) {
      throw new Error('Invalid tar header: unknown format.')
    }
  }

  // to support old tar versions that use trailing / to indicate dirs
  if (typeflag === 0 && name && name[name.length - 1] === '/') typeflag = 5

  return {
    name,
    mode,
    uid,
    gid,
    size,
    mtime: new Date(1000 * mtime),
    type,
    linkname,
    uname,
    gname,
    devmajor,
    devminor,
    pax: null
  }
}

function isUSTAR (buf) {
  return b4a.equals(USTAR_MAGIC, buf.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 6))
}

function isGNU (buf) {
  return b4a.equals(GNU_MAGIC, buf.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 6)) &&
    b4a.equals(GNU_VER, buf.subarray(VERSION_OFFSET, VERSION_OFFSET + 2))
}

function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function toType (flag) {
  switch (flag) {
    case 0:
      return 'file'
    case 1:
      return 'link'
    case 2:
      return 'symlink'
    case 3:
      return 'character-device'
    case 4:
      return 'block-device'
    case 5:
      return 'directory'
    case 6:
      return 'fifo'
    case 7:
      return 'contiguous-file'
    case 72:
      return 'pax-header'
    case 55:
      return 'pax-global-header'
    case 27:
      return 'gnu-long-link-path'
    case 28:
    case 30:
      return 'gnu-long-path'
  }

  return null
}

function toTypeflag (flag) {
  switch (flag) {
    case 'file':
      return 0
    case 'link':
      return 1
    case 'symlink':
      return 2
    case 'character-device':
      return 3
    case 'block-device':
      return 4
    case 'directory':
      return 5
    case 'fifo':
      return 6
    case 'contiguous-file':
      return 7
    case 'pax-header':
      return 72
  }

  return 0
}

function indexOf (block, num, offset, end) {
  for (; offset < end; offset++) {
    if (block[offset] === num) return offset
  }
  return end
}

function cksum (block) {
  let sum = 8 * 32
  for (let i = 0; i < 148; i++) sum += block[i]
  for (let j = 156; j < 512; j++) sum += block[j]
  return sum
}

function encodeOct (val, n) {
  val = val.toString(8)
  if (val.length > n) return SEVENS.slice(0, n) + ' '
  return ZEROS.slice(0, n - val.length) + val + ' '
}

function encodeSizeBin (num, buf, off) {
  buf[off] = 0x80
  for (let i = 11; i > 0; i--) {
    buf[off + i] = num & 0xff
    num = Math.floor(num / 0x100)
  }
}

function encodeSize (num, buf, off) {
  if (num.toString(8).length > 11) {
    encodeSizeBin(num, buf, off)
  } else {
    b4a.write(buf, encodeOct(num, 11), off)
  }
}

/* Copied from the node-tar repo and modified to meet
 * tar-stream coding standard.
 *
 * Source: https://github.com/npm/node-tar/blob/51b6627a1f357d2eb433e7378e5f05e83b7aa6cd/lib/header.js#L349
 */
function parse256 (buf) {
  // first byte MUST be either 80 or FF
  // 80 for positive, FF for 2's comp
  let positive
  if (buf[0] === 0x80) positive = true
  else if (buf[0] === 0xFF) positive = false
  else return null

  // build up a base-256 tuple from the least sig to the highest
  const tuple = []
  let i
  for (i = buf.length - 1; i > 0; i--) {
    const byte = buf[i]
    if (positive) tuple.push(byte)
    else tuple.push(0xFF - byte)
  }

  let sum = 0
  const l = tuple.length
  for (i = 0; i < l; i++) {
    sum += tuple[i] * Math.pow(256, i)
  }

  return positive ? sum : -1 * sum
}

function decodeOct (val, offset, length) {
  val = val.subarray(offset, offset + length)
  offset = 0

  // If prefixed with 0x80 then parse as a base-256 integer
  if (val[offset] & 0x80) {
    return parse256(val)
  } else {
    // Older versions of tar can prefix with spaces
    while (offset < val.length && val[offset] === 32) offset++
    const end = clamp(indexOf(val, 32, offset, val.length), val.length, val.length)
    while (offset < end && val[offset] === 0) offset++
    if (end === offset) return 0
    return parseInt(val.subarray(offset, end).toString(), 8)
  }
}

function decodeStr (val, offset, length, encoding) {
  return b4a.toString(val.subarray(offset, indexOf(val, 0, offset, offset + length)), encoding)
}

function addLength (str) {
  const len = b4a.byteLength(str)
  let digits = Math.floor(Math.log(len) / Math.log(10)) + 1
  if (len + digits >= Math.pow(10, digits)) digits++

  return (len + digits) + str
}


/***/ }),

/***/ 2283:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

exports.extract = __nccwpck_require__(2931)
exports.pack = __nccwpck_require__(4930)


/***/ }),

/***/ 4930:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Readable, Writable, getStreamError } = __nccwpck_require__(5147)
const b4a = __nccwpck_require__(3497)

const constants = __nccwpck_require__(8926)
const headers = __nccwpck_require__(8860)

const DMODE = 0o755
const FMODE = 0o644

const END_OF_TAR = b4a.alloc(1024)

class Sink extends Writable {
  constructor (pack, header, callback) {
    super({ mapWritable, eagerOpen: true })

    this.written = 0
    this.header = header

    this._callback = callback
    this._linkname = null
    this._isLinkname = header.type === 'symlink' && !header.linkname
    this._isVoid = header.type !== 'file' && header.type !== 'contiguous-file'
    this._finished = false
    this._pack = pack
    this._openCallback = null

    if (this._pack._stream === null) this._pack._stream = this
    else this._pack._pending.push(this)
  }

  _open (cb) {
    this._openCallback = cb
    if (this._pack._stream === this) this._continueOpen()
  }

  _continuePack (err) {
    if (this._callback === null) return

    const callback = this._callback
    this._callback = null

    callback(err)
  }

  _continueOpen () {
    if (this._pack._stream === null) this._pack._stream = this

    const cb = this._openCallback
    this._openCallback = null
    if (cb === null) return

    if (this._pack.destroying) return cb(new Error('pack stream destroyed'))
    if (this._pack._finalized) return cb(new Error('pack stream is already finalized'))

    this._pack._stream = this

    if (!this._isLinkname) {
      this._pack._encode(this.header)
    }

    if (this._isVoid) {
      this._finish()
      this._continuePack(null)
    }

    cb(null)
  }

  _write (data, cb) {
    if (this._isLinkname) {
      this._linkname = this._linkname ? b4a.concat([this._linkname, data]) : data
      return cb(null)
    }

    if (this._isVoid) {
      if (data.byteLength > 0) {
        return cb(new Error('No body allowed for this entry'))
      }
      return cb()
    }

    this.written += data.byteLength
    if (this._pack.push(data)) return cb()
    this._pack._drain = cb
  }

  _finish () {
    if (this._finished) return
    this._finished = true

    if (this._isLinkname) {
      this.header.linkname = this._linkname ? b4a.toString(this._linkname, 'utf-8') : ''
      this._pack._encode(this.header)
    }

    overflow(this._pack, this.header.size)

    this._pack._done(this)
  }

  _final (cb) {
    if (this.written !== this.header.size) { // corrupting tar
      return cb(new Error('Size mismatch'))
    }

    this._finish()
    cb(null)
  }

  _getError () {
    return getStreamError(this) || new Error('tar entry destroyed')
  }

  _predestroy () {
    this._pack.destroy(this._getError())
  }

  _destroy (cb) {
    this._pack._done(this)

    this._continuePack(this._finished ? null : this._getError())

    cb()
  }
}

class Pack extends Readable {
  constructor (opts) {
    super(opts)
    this._drain = noop
    this._finalized = false
    this._finalizing = false
    this._pending = []
    this._stream = null
  }

  entry (header, buffer, callback) {
    if (this._finalized || this.destroying) throw new Error('already finalized or destroyed')

    if (typeof buffer === 'function') {
      callback = buffer
      buffer = null
    }

    if (!callback) callback = noop

    if (!header.size || header.type === 'symlink') header.size = 0
    if (!header.type) header.type = modeToType(header.mode)
    if (!header.mode) header.mode = header.type === 'directory' ? DMODE : FMODE
    if (!header.uid) header.uid = 0
    if (!header.gid) header.gid = 0
    if (!header.mtime) header.mtime = new Date()

    if (typeof buffer === 'string') buffer = b4a.from(buffer)

    const sink = new Sink(this, header, callback)

    if (b4a.isBuffer(buffer)) {
      header.size = buffer.byteLength
      sink.write(buffer)
      sink.end()
      return sink
    }

    if (sink._isVoid) {
      return sink
    }

    return sink
  }

  finalize () {
    if (this._stream || this._pending.length > 0) {
      this._finalizing = true
      return
    }

    if (this._finalized) return
    this._finalized = true

    this.push(END_OF_TAR)
    this.push(null)
  }

  _done (stream) {
    if (stream !== this._stream) return

    this._stream = null

    if (this._finalizing) this.finalize()
    if (this._pending.length) this._pending.shift()._continueOpen()
  }

  _encode (header) {
    if (!header.pax) {
      const buf = headers.encode(header)
      if (buf) {
        this.push(buf)
        return
      }
    }
    this._encodePax(header)
  }

  _encodePax (header) {
    const paxHeader = headers.encodePax({
      name: header.name,
      linkname: header.linkname,
      pax: header.pax
    })

    const newHeader = {
      name: 'PaxHeader',
      mode: header.mode,
      uid: header.uid,
      gid: header.gid,
      size: paxHeader.byteLength,
      mtime: header.mtime,
      type: 'pax-header',
      linkname: header.linkname && 'PaxHeader',
      uname: header.uname,
      gname: header.gname,
      devmajor: header.devmajor,
      devminor: header.devminor
    }

    this.push(headers.encode(newHeader))
    this.push(paxHeader)
    overflow(this, paxHeader.byteLength)

    newHeader.size = header.size
    newHeader.type = header.type
    this.push(headers.encode(newHeader))
  }

  _doDrain () {
    const drain = this._drain
    this._drain = noop
    drain()
  }

  _predestroy () {
    const err = getStreamError(this)

    if (this._stream) this._stream.destroy(err)

    while (this._pending.length) {
      const stream = this._pending.shift()
      stream.destroy(err)
      stream._continueOpen()
    }

    this._doDrain()
  }

  _read (cb) {
    this._doDrain()
    cb()
  }
}

module.exports = function pack (opts) {
  return new Pack(opts)
}

function modeToType (mode) {
  switch (mode & constants.S_IFMT) {
    case constants.S_IFBLK: return 'block-device'
    case constants.S_IFCHR: return 'character-device'
    case constants.S_IFDIR: return 'directory'
    case constants.S_IFIFO: return 'fifo'
    case constants.S_IFLNK: return 'symlink'
  }

  return 'file'
}

function noop () {}

function overflow (self, size) {
  size &= 511
  if (size) self.push(END_OF_TAR.subarray(0, 512 - size))
}

function mapWritable (buf) {
  return b4a.isBuffer(buf) ? buf : b4a.from(buf)
}


/***/ }),

/***/ 4294:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(4219);


/***/ }),

/***/ 4219:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 7127:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {


/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

module.exports = __nccwpck_require__(3837).deprecate;


/***/ }),

/***/ 5840:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "v1", ({
  enumerable: true,
  get: function () {
    return _v.default;
  }
}));
Object.defineProperty(exports, "v3", ({
  enumerable: true,
  get: function () {
    return _v2.default;
  }
}));
Object.defineProperty(exports, "v4", ({
  enumerable: true,
  get: function () {
    return _v3.default;
  }
}));
Object.defineProperty(exports, "v5", ({
  enumerable: true,
  get: function () {
    return _v4.default;
  }
}));
Object.defineProperty(exports, "NIL", ({
  enumerable: true,
  get: function () {
    return _nil.default;
  }
}));
Object.defineProperty(exports, "version", ({
  enumerable: true,
  get: function () {
    return _version.default;
  }
}));
Object.defineProperty(exports, "validate", ({
  enumerable: true,
  get: function () {
    return _validate.default;
  }
}));
Object.defineProperty(exports, "stringify", ({
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
}));
Object.defineProperty(exports, "parse", ({
  enumerable: true,
  get: function () {
    return _parse.default;
  }
}));

var _v = _interopRequireDefault(__nccwpck_require__(8628));

var _v2 = _interopRequireDefault(__nccwpck_require__(6409));

var _v3 = _interopRequireDefault(__nccwpck_require__(5122));

var _v4 = _interopRequireDefault(__nccwpck_require__(9120));

var _nil = _interopRequireDefault(__nccwpck_require__(5332));

var _version = _interopRequireDefault(__nccwpck_require__(1595));

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 4569:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('md5').update(bytes).digest();
}

var _default = md5;
exports["default"] = _default;

/***/ }),

/***/ 5332:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports["default"] = _default;

/***/ }),

/***/ 2746:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports["default"] = _default;

/***/ }),

/***/ 814:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports["default"] = _default;

/***/ }),

/***/ 807:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = rng;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto.default.randomFillSync(rnds8Pool);

    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ 5274:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('sha1').update(bytes).digest();
}

var _default = sha1;
exports["default"] = _default;

/***/ }),

/***/ 8950:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports["default"] = _default;

/***/ }),

/***/ 8628:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports["default"] = _default;

/***/ }),

/***/ 6409:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5998));

var _md = _interopRequireDefault(__nccwpck_require__(4569));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports["default"] = _default;

/***/ }),

/***/ 5998:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ 5122:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports["default"] = _default;

/***/ }),

/***/ 9120:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5998));

var _sha = _interopRequireDefault(__nccwpck_require__(5274));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports["default"] = _default;

/***/ }),

/***/ 6900:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _regex = _interopRequireDefault(__nccwpck_require__(814));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports["default"] = _default;

/***/ }),

/***/ 1595:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports["default"] = _default;

/***/ }),

/***/ 2940:
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 6454:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * ZipStream
 *
 * @ignore
 * @license [MIT]{@link https://github.com/archiverjs/node-zip-stream/blob/master/LICENSE}
 * @copyright (c) 2014 Chris Talkington, contributors.
 */
var inherits = (__nccwpck_require__(3837).inherits);

var ZipArchiveOutputStream = (__nccwpck_require__(5445).ZipArchiveOutputStream);
var ZipArchiveEntry = (__nccwpck_require__(5445).ZipArchiveEntry);

var util = __nccwpck_require__(2072);

/**
 * @constructor
 * @extends external:ZipArchiveOutputStream
 * @param {Object} [options]
 * @param {String} [options.comment] Sets the zip archive comment.
 * @param {Boolean} [options.forceLocalTime=false] Forces the archive to contain local file times instead of UTC.
 * @param {Boolean} [options.forceZip64=false] Forces the archive to contain ZIP64 headers.
 * @param {Boolean} [options.store=false] Sets the compression method to STORE.
 * @param {Object} [options.zlib] Passed to [zlib]{@link https://nodejs.org/api/zlib.html#zlib_class_options}
 * to control compression.
 */
var ZipStream = module.exports = function(options) {
  if (!(this instanceof ZipStream)) {
    return new ZipStream(options);
  }

  options = this.options = options || {};
  options.zlib = options.zlib || {};

  ZipArchiveOutputStream.call(this, options);

  if (typeof options.level === 'number' && options.level >= 0) {
    options.zlib.level = options.level;
    delete options.level;
  }

  if (!options.forceZip64 && typeof options.zlib.level === 'number' && options.zlib.level === 0) {
    options.store = true;
  }

  options.namePrependSlash = options.namePrependSlash || false;

  if (options.comment && options.comment.length > 0) {
    this.setComment(options.comment);
  }
};

inherits(ZipStream, ZipArchiveOutputStream);

/**
 * Normalizes entry data with fallbacks for key properties.
 *
 * @private
 * @param  {Object} data
 * @return {Object}
 */
ZipStream.prototype._normalizeFileData = function(data) {
  data = util.defaults(data, {
    type: 'file',
    name: null,
    namePrependSlash: this.options.namePrependSlash,
    linkname: null,
    date: null,
    mode: null,
    store: this.options.store,
    comment: ''
  });

  var isDir = data.type === 'directory';
  var isSymlink = data.type === 'symlink';

  if (data.name) {
    data.name = util.sanitizePath(data.name);

    if (!isSymlink && data.name.slice(-1) === '/') {
      isDir = true;
      data.type = 'directory';
    } else if (isDir) {
      data.name += '/';
    }
  }

  if (isDir || isSymlink) {
    data.store = true;
  }

  data.date = util.dateify(data.date);

  return data;
};

/**
 * Appends an entry given an input source (text string, buffer, or stream).
 *
 * @param  {(Buffer|Stream|String)} source The input source.
 * @param  {Object} data
 * @param  {String} data.name Sets the entry name including internal path.
 * @param  {String} [data.comment] Sets the entry comment.
 * @param  {(String|Date)} [data.date=NOW()] Sets the entry date.
 * @param  {Number} [data.mode=D:0755/F:0644] Sets the entry permissions.
 * @param  {Boolean} [data.store=options.store] Sets the compression method to STORE.
 * @param  {String} [data.type=file] Sets the entry type. Defaults to `directory`
 * if name ends with trailing slash.
 * @param  {Function} callback
 * @return this
 */
ZipStream.prototype.entry = function(source, data, callback) {
  if (typeof callback !== 'function') {
    callback = this._emitErrorCallback.bind(this);
  }

  data = this._normalizeFileData(data);

  if (data.type !== 'file' && data.type !== 'directory' && data.type !== 'symlink') {
    callback(new Error(data.type + ' entries not currently supported'));
    return;
  }

  if (typeof data.name !== 'string' || data.name.length === 0) {
    callback(new Error('entry name must be a non-empty string value'));
    return;
  }

  if (data.type === 'symlink' && typeof data.linkname !== 'string') {
    callback(new Error('entry linkname must be a non-empty string value when type equals symlink'));
    return;
  }

  var entry = new ZipArchiveEntry(data.name);
  entry.setTime(data.date, this.options.forceLocalTime);

  if (data.namePrependSlash) {
    entry.setName(data.name, true);
  }

  if (data.store) {
    entry.setMethod(0);
  }

  if (data.comment.length > 0) {
    entry.setComment(data.comment);
  }

  if (data.type === 'symlink' && typeof data.mode !== 'number') {
    data.mode = 40960; // 0120000
  }

  if (typeof data.mode === 'number') {
    if (data.type === 'symlink') {
      data.mode |= 40960;
    }

    entry.setUnixMode(data.mode);
  }

  if (data.type === 'symlink' && typeof data.linkname === 'string') {
    source = Buffer.from(data.linkname);
  }

  return ZipArchiveOutputStream.prototype.entry.call(this, entry, source, callback);
};

/**
 * Finalizes the instance and prevents further appending to the archive
 * structure (queue will continue til drained).
 *
 * @return void
 */
ZipStream.prototype.finalize = function() {
  this.finish();
};

/**
 * Returns the current number of bytes written to this stream.
 * @function ZipStream#getBytesWritten
 * @returns {Number}
 */

/**
 * Compress Commons ZipArchiveOutputStream
 * @external ZipArchiveOutputStream
 * @see {@link https://github.com/archiverjs/node-compress-commons}
 */


/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 4300:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 2057:
/***/ ((module) => {

"use strict";
module.exports = require("constants");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nccwpck_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(3109);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map