const fs = require('fs');
const path = require('path')
const ApiError = require('../exceptions/api-error');

class TranslationService {
    translateText = async (req, message) => {
        const lang = this.getLangFromReq(req);
        return await this.getTranslateMessage(lang, message);
    }
    getLangFromReq(req) {
        const lang = req.headers['accept-language'];
        return lang;
    }
    getTranslateMessage = async (lang, message) => {
        const translateFile = await this.getTranslateFile(lang);
        if (!(translateFile instanceof Error)) {
            message = translateFile[message.split('.')[0]]?.[message.split('.')[1]] ?? message;
        }
        return message;
    }
    async getTranslateFile(lang) {
        if (lang.length > 2) {
            lang = lang.slice(0, 2);
        }
        try {
            const filePath = path.join(__dirname, '..', 'translations', `${lang}.json`);
            const file = await new Promise((res, rej) => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        rej(ApiError.BadRequest('translate.searchFileErrorMessage'));
                    }
                    try {
                        const jsonData = JSON.parse(data);
                        res(jsonData);
                    } catch (e) {
                        rej(ApiError.BadRequest('translate.parseErrorMessage'))
                    }
                })
            })

            return file;
        } catch (e) {
            return e;
        }
    }
}

module.exports = new TranslationService();