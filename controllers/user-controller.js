const userService = require('../service/user-service');
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error');
const mailService = require('../service/mail-service');
const { translateText } = require('../service/translation-service');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ты ошибка', errors.array()));
            }
            const { email, password, name, surname } = req.body;
            const userData = await userService.registration(email, password, name, surname);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.status(200).json({
                message: await translateText(req, 'registration.registrationSuccessMessage'),
                status: 200,
                data: userData
            });
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json({
                message: await translateText(req, 'login.loginSuccessMessage'),
                status: 200,
                data: userData,
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json({ message: 'Вы успешно вышли из аккаунта' });
        } catch (e) {
            next(e);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const accessToken = req.headers.authorization.split(' ')[1];
            const { id } = await userService.getUserByAccessToken(accessToken)
            const isSuccess = userService.deleteUser(id);

            if (!isSuccess) {
                return res.json({
                    message: 'Неизвестная ошибка при удалении профиля',
                    status: 500,
                })
            }

            return res.json({
                message: 'Пользователь успешно удален',
                status: 200
            })
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.json({ status: 200, message: 'Вы успешно потдвердили свой аккаунт' });
        } catch (e) {
            next(e);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;
            const accessToken = req.headers.authorization.split(' ')[1];
            const { id } = await userService.getUserByAccessToken(accessToken)
            await userService.changePassword(id, oldPassword, newPassword);
            res.status(200).json({
                message: 'Вы успешно поменяли пароль',
                status: 200
            })
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const accessToken = req.headers.authorization.split(' ')[1];
            const userData = await userService.getUserByAccessToken(accessToken)
            res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async editUserProfile(req, res, next) {
        try {
            if (!req.body.id) {
                const accessToken = req.headers.authorization.split(' ')[1];
                const { id } = await userService.getUserByAccessToken(accessToken);
                req.body.id = id;
            }
            const isSuccess = userService.editProfile(req.body);
            if (!isSuccess) {
                return res.json({
                    message: 'Неизвестная ошибка при изменении профиля',
                    status: 500,
                })
            }

            return res.json({
                message: 'Пользователь успешно изменен',
                status: 200
            })
        } catch (e) {
            next(e);
        }
    }
    async sendCode(req, res, next) {
        try {
            const newEmail = req.body.email;
            const accessToken = req.headers.authorization.split(' ')[1];
            const userData = await userService.getUserByAccessToken(accessToken);
            if (!newEmail) {
                return next(ApiError.BadRequest('Пожалуйста введите почту('))
            }
            const generateCode = (Math.random() * 1000000).toFixed(0);
            await userService.setUserParamById(generateCode, 'code', userData.id);
            await mailService.sendCode(newEmail, generateCode)
            res.send({
                message: 'Код успешно отправлен на почту',
                status: 200,
            })
        } catch (e) {
            next(e);
        }
    }
    async changeEmail(req, res, next) {
        try {
            const { email, code } = req.body;
            const accessToken = req.headers.authorization.split(' ')[1];
            const userData = await userService.getUserByAccessToken(accessToken);
            if (!userData.code) {
                return next(ApiError.BadRequest('Пожалуйста отправьте код'))
            }
            if (+userData.code !== +code) {
                return next(ApiError.BadRequest('Введен неправильный код'))
            }
            const emails = await userService.checkEmailIsEntry(email);
            if (emails.length > 0) {
                return next(ApiError.BadRequest('Такая почта уже существует'))
            }
            await userService.setUserParamById(email, 'email', userData.id);
            await userService.setUserParamById(null, 'code', userData.id);
            res.json({
                message: 'Вы успешно изменили почту',
                status: 200
            })
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();