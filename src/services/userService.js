import db from '../models/index';
import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (userEmail, userPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(userEmail);
            if (isExist) {
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    where: { email: userEmail }
                })
                if (user) {
                    let check = await bcrypt.compareSync(userPassword, user.password);
                    if (check) {
                        userData.errorCode = 0;
                        userData.message = `Ok`;
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errorCode = 3;
                        userData.message = `Wrong password`;
                    }
                } else {
                    userData.errorCode = 2;
                    userData.message = `User not found !`;
                    resolve(userData);
                }
                resolve(userData);
            } else {
                userData.errorCode = 1;
                userData.message = `Your email in not exist in our database`;
                resolve(userData);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = [];
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password'],
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password'],
                    }
                })
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Email has existed. Please try another email.'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.image
                })

                resolve({
                    errorCode: 0,
                    message: 'Ok'
                });
            }

        } catch (error) {
            reject(error);
        }
    })
}

let editUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userData.id || !userData.gender || !userData.roleId || !userData.positionId) {
                resolve({
                    errorCode: 2,
                    errorMessage: 'Missing required parameter.'
                })
            } else {
                let user = await db.User.findOne({
                    where: { id: userData.id },
                    raw: false
                });
                if (user) {
                    user.firstName = userData.firstName;
                    user.lastName = userData.lastName;
                    user.address = userData.address;
                    user.phoneNumber = userData.phoneNumber;
                    user.gender = userData.gender;
                    user.roleId = userData.roleId;
                    user.positionId = userData.positionId;
                    user.updatedAt = new Date();
                    if (userData.image) {
                        user.image = userData.image;
                    }
                    await user.save();
                    resolve({
                        errorCode: 0,
                        message: 'Update user successfully'
                    });
                } else {
                    resolve({
                        errorCode: 1,
                        errorMessage: 'User not found'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: false
            });
            if (!user) {
                resolve({
                    errorCode: 2,
                    errorMessage: 'User not found'
                })
            } else {
                await user.destroy();
                resolve({
                    errorCode: 0,
                    message: 'User deleted'
                });
            }

        } catch (error) {
            reject(error);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(user);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    })
}

let getAllcode = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required field'
                });
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errorCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    editUser: editUser,
    deleteUser: deleteUser,
    getAllcode: getAllcode,
}