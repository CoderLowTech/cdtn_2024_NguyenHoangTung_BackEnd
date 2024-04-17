import db from '../models/index';

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.image || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errorCode: 1,
                    errorMessage: "Missing required parameter"
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                    image: data.image
                })

                resolve({
                    errorCode: 0,
                    errorMessage: "Ok"
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }

            if (!data) data = {}

            resolve({
                errorCode: 0,
                errorMessage: 'Ok',
                data: data
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errorCode: 1,
                    errorMessage: "Missing required parameter"
                })
            } else {
                let data = {};
                if (inputId === 'ALL') {

                    let doctorSpecialty = []
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            attributes: ['doctorId', 'provinceId']
                        })
                        data.doctorSpecialty = doctorSpecialty;
                    } else {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                        data.doctorSpecialty = doctorSpecialty;
                    }
                } else {
                    data = await db.Specialty.findOne({
                        where: { id: inputId },
                        attributes: ['descriptionHTML', 'descriptionMarkdown']
                    })

                    if (data) {
                        let doctorSpecialty = []
                        if (location === 'ALL') {
                            doctorSpecialty = await db.Doctor_Infor.findAll({
                                where: {
                                    specialtyId: inputId
                                },
                                attributes: ['doctorId', 'provinceId']
                            })
                            data.doctorSpecialty = doctorSpecialty;
                        } else {
                            doctorSpecialty = await db.Doctor_Infor.findAll({
                                where: {
                                    specialtyId: inputId,
                                    provinceId: location
                                },
                                attributes: ['doctorId', 'provinceId']
                            })
                            data.doctorSpecialty = doctorSpecialty;
                        }
                    } else {
                        data = {};
                    }
                }

                resolve({
                    errorCode: 0,
                    data: data
                })

            }
        } catch (error) {
            reject(error);
        }
    })
}

let deleteSpecialty = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialty = await db.Specialty.findOne({
                where: { id: specialtyId },
                raw: false
            });
            if (!specialty) {
                resolve({
                    errorCode: 2,
                    errorMessage: 'Specialty not found'
                })
            } else {
                await specialty.destroy();
                resolve({
                    errorCode: 0,
                    errorMessage: 'Specialty deleted'
                });
            }

        } catch (error) {
            reject(error);
        }
    })
}

let editSpecialty = (specialtyData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!specialtyData.id ||
                !specialtyData.name ||
                !specialtyData.descriptionHTML ||
                !specialtyData.descriptionMarkdown ||
                !specialtyData.image) {
                resolve({
                    errorCode: 2,
                    errorMessage: 'Missing required parameter.'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: specialtyData.id },
                    raw: false
                });
                if (specialty) {
                    specialty.name = specialtyData.name;
                    specialty.descriptionHTML = specialtyData.descriptionHTML;
                    specialty.descriptionMarkdown = specialtyData.descriptionMarkdown;
                    specialty.image = specialtyData.image;
                    specialty.updatedAt = new Date();
                    await specialty.save();
                    resolve({
                        errorCode: 0,
                        message: 'Update specialty successfully'
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

module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    deleteSpecialty: deleteSpecialty,
    editSpecialty: editSpecialty
}
