const Database = require('../db');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dtos');
const ApiError = require('../exceptions/api-error');

class UserService extends Database {
    async checkEmailIsEntry(email) {
        const res = await this.query('SELECT * FROM user WHERE email = ?', email);
        return res;
    }
    async registration(email, password, name, surname) {
        const res = await this.checkEmailIsEntry(email);
        if (res.length !== 0) {
            throw ApiError.BadRequest(`Пользователь с email ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        await this.query(
            'INSERT INTO user (email, password, activationLink, name, surname, isActivated) VALUES (?, ?, ?, ?, ?, false)',
            email, hashPassword, activationLink, name, surname
        );
        const [user] = await this.query('SELECT * FROM user WHERE email = ?', email);
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async login(email, password) {
        const res = await this.query(`
        SELECT 
            email, name, surname, id, isActivated, avatar, password
        FROM 
            user 
        WHERE 
            email = ?
        `, email);

        if (res.length === 0) {
            throw ApiError.BadRequest(`login.mailNotFoundMessage`);
        }
        const isPasswordEqual = await bcrypt.compare(password, res[0].password);
        if (!isPasswordEqual) {
            throw ApiError.BadRequest('login.wrongPasswordMessage');
        }

        const userDto = new UserDto(res[0]);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }
    async changePassword(userId, oldPassword, newPassword) {
        const res = await this.query(`
        SELECT 
            email, name, surname, id, isActivated, avatar , password
        FROM 
            user 
        WHERE 
            id = ?
        `, userId);
        const isPasswordEqual = await bcrypt.compare(oldPassword, res[0].password);
        if (!isPasswordEqual) {
            throw new ApiError(400, `login.wrongPasswordMessage`);
        }
        const hashPassword = await bcrypt.hash(newPassword, 3);

        await this.setUserParamById(hashPassword, 'password', userId);
        return true;
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async activate(activateLink) {
        const activateQuery = 'UPDATE user SET isActivated = 1 WHERE activationLink = ?'
        await this.query(activateQuery, activateLink);
        return true;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const tokenIsValidate = await tokenService.validateRefreshToken(refreshToken);
        if (!tokenIsValidate) {
            throw ApiError.UnauthorizedError();
        }
        const user = await this.getUserByParam(tokenIsValidate.id, "id")
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }
    // Retrieve all users from the database
    async getAllUsers() {
        return await this.query('SELECT * FROM user');
    }

    // Create the @getUser method for recieving a user from the db
    async getUserByParam(userField, method) {
        const getUserQuery = `SELECT * FROM user WHERE ${method} = ?`
        const [userData] = await this.query(getUserQuery, userField);
        return userData;
    }

    // Update a user's database column info by provide the 
    // user's parameter to its change and the new value
    async setUserParamById(fieldValue, method, id) {
        const getUserQuery = `UPDATE user SET ${method} = ? WHERE id = ? `
        const userData = await this.query(getUserQuery, fieldValue, id);
        return userData;
    }
    // Retrieve the user from the database by an access token 
    async getUserByAccessToken(token) {
        const { id } = tokenService.validateAccessToken(token);
        const user = await this.getUserByParam(id, 'id');
        return new UserDto(user);
    }
    // Update a full user info 
    async editProfile(data) {
        const dataEntries = Object.entries(data);
        let query = 'UPDATE user SET'
        if (dataEntries.length <= 0) {
            return true;
        }

        dataEntries.forEach(([method, property], index) => {
            query += ` ${method} = '${property}'`;
            if (index !== dataEntries.length - 1) {
                query += ','
            }
        });
        query += ' WHERE id = ?'

        await this.query(query, data.id);
        return true;
    }

    // Change a user's data by take @method param to point out the changing field 
    // and the @newData param, which will update a current user's data
    async changeUserData(token, method, newData) {
        // Validate the user by the validating method for accessing they data
        const user = tokenService.validateAccessToken(token)
        if (user.err) throw ApiError('While changeing user data happened an error');
        const changeUserMailQuery = `UPDATE user SET ${method} = ? WHERE name = ?`
        const changeUserMailQueryData = [newData, user.name]

        const res = await this.query(changeUserMailQuery, changeUserMailQueryData)
        return res;
    }
}

module.exports = new UserService();