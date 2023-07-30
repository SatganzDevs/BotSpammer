"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const follow_redirects_1 = __importDefault(require("follow-redirects"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const mime_types_1 = __importDefault(require("mime-types"));
const path_2 = require("path");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const sharp_1 = __importDefault(require("sharp"));
const fs_2 = require("fs");
const qr_image_1 = __importDefault(require("qr-image"));
const { http, https } = follow_redirects_1.default;
const utils = {
    formatPhone: (contact, full = false) => {
        let domain = contact.includes('@g.us') ? '@g.us' : '@s.whatsapp.net';
        contact = contact.replace(domain, '');
        return !full ? `${contact}${domain}` : contact;
    },
    generateRefprovider: (prefix = '') => prefix ? `${prefix}_${crypto_1.default.randomUUID()}` : crypto_1.default.randomUUID(),
    isValidNumber: (rawNumber) => !rawNumber.match(/\@g.us\b/gm),
    prepareMedia: (media) => {
        if (utils.isUrl(media)) {
            return { url: media };
        }
        else {
            try {
                return { buffer: (0, fs_1.readFileSync)(media) };
            }
            catch (e) {
                console.error(`Failed to read file at ${media}`, e);
                throw e;
            }
        }
    },
    isUrl: (s) => {
        try {
            new URL(s);
            return true;
        }
        catch (_a) {
            return false;
        }
    },
    generalDownload: async (url) => {
        const checkIsLocal = (0, fs_1.existsSync)(url);
        const handleDownload = () => {
            const checkProtocol = url.includes('https:');
            const handleHttp = checkProtocol ? https : http;
            const name = `tmp-${Date.now()}-dat`;
            const fullPath = `${(0, os_1.tmpdir)()}/${name}`;
            const file = (0, fs_1.createWriteStream)(fullPath);
            if (checkIsLocal) {
                /**
                 * From Local
                 */
                return new Promise((res) => {
                    const response = {
                        headers: {
                            'content-type': mime_types_1.default.contentType((0, path_2.extname)(url)) || 'application/octet-stream',
                        },
                    };
                    res({ response, fullPath: url });
                });
            }
            else {
                /**
                 * From URL
                 */
                return new Promise((res, rej) => {
                    handleHttp.get(url, function (response) {
                        response.pipe(file);
                        file.on('finish', async function () {
                            file.close();
                            res({ response, fullPath });
                        });
                        file.on('error', function () {
                            file.close();
                            rej(null);
                        });
                    });
                });
            }
        };
        const handleFile = (pathInput, ext) => new Promise((resolve, reject) => {
            const fullPath = `${pathInput}.${ext}`;
            (0, fs_1.rename)(pathInput, fullPath, (err) => {
                if (err)
                    reject(null);
                resolve(fullPath);
            });
        });
        const httpResponse = await handleDownload();
        const { ext } = await utils.fileTypeFromFile(httpResponse.response);
        const getPath = await handleFile(httpResponse.fullPath, ext);
        return getPath;
    },
    convertAudio: async (filePath = '', format = 'opus') => {
        const formats = {
            mp3: {
                code: 'libmp3lame',
                ext: 'mp3',
            },
            opus: {
                code: 'libopus',
                ext: 'opus',
            },
        };
        const opusFilePath = path_1.default.join(path_1.default.dirname(filePath), `${path_1.default.basename(filePath, path_1.default.extname(filePath))}.${formats[format].ext}`);
        await new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(filePath)
                .audioCodec(formats[format].code)
                .audioBitrate('64k')
                .format(formats[format].ext)
                .output(opusFilePath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        return opusFilePath;
    },
    fileTypeFromFile: async (response) => {
        var _a;
        const type = (_a = response.headers['content-type']) !== null && _a !== void 0 ? _a : null;
        const ext = mime_types_1.default.extension(type);
        return {
            type,
            ext,
        };
    },
    baileyGenerateImage: async (base64, name = 'qr.png') => {
        const PATH_QR = `${process.cwd()}/${name}`;
        let qr_svg = qr_image_1.default.image(base64, { type: 'png', margin: 4 });
        const writeFilePromise = () => new Promise((resolve, reject) => {
            const file = qr_svg.pipe((0, fs_1.createWriteStream)(PATH_QR));
            file.on('finish', () => resolve(true));
            file.on('error', reject);
        });
        await writeFilePromise();
        await utils.cleanImage(PATH_QR);
    },
    cleanImage: async (FROM) => {
        const readBuffer = () => {
            return new Promise((resolve, reject) => {
                (0, fs_2.readFile)(FROM, (err, data) => {
                    if (err)
                        reject(err);
                    const imageBuffer = Buffer.from(data);
                    resolve(imageBuffer);
                });
            });
        };
        const imgBuffer = await readBuffer();
        return new Promise((resolve, reject) => {
            (0, sharp_1.default)(imgBuffer)
                .extend({
                top: 15,
                bottom: 15,
                left: 15,
                right: 15,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
                .toFile(FROM, (err) => {
                if (err)
                    reject(err);
                resolve(true);
            });
        });
    }
};
exports.default = utils;
