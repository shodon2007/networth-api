const { getTranslateFile } = require("../service/translation-service");

class TranslationController {
    async translation(req, res, next) {
        try {
            const lang = req.params.lang;
            const file = await getTranslateFile(lang);
            if (file instanceof Error) {
                throw file;
            }
            res.json(file);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TranslationController();