const ApiError = require('../exceptions/api-error');
const { getTranslateMessage, getLangFromReq } = require('../service/translation-service');

module.exports = async (err, req, res, next) => {
    const lang = getLangFromReq(req);

    const message = await getTranslateMessage(lang, err.message);
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: message, errors: err.errors, status: err.status });
    }

    return res.status(500).json({ message: 'Непредвиденная ошибка', status: 500 });
}