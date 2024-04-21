import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';
import emailService from '../services/emailService';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password'],
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                    {
                        model: db.Doctor_Infor, attributes: ['specialtyId'],
                        include: [
                            { model: db.Specialty, as: 'specialtyTypeData', attributes: ['name'] }
                        ]
                    }
                ],
                raw: true,
                nest: true

            })
            resolve({
                errorCode: 0,
                data: doctors
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                }
            })
            resolve({
                errorCode: 0,
                data: doctors
            })
        } catch (error) {
            reject(error);
        }
    })
}

let checkValidInput = (inputData) => {
    let isValid = true;
    let inValidElement = '';
    let arrInput = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice',
        'selectedPayment', 'selectedProvince', 'nameClinic',
        'addressClinic', 'selectedSpecialty'];
    for (let i = 0; i < arrInput.length; i++) {
        if (!inputData[arrInput[i]]) {
            isValid = false;
            inValidElement = arrInput[i];
            break;
        }
    }

    return {
        isValid: isValid,
        inValidElement: inValidElement
    }
}

let postDoctorInfo = (dataInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkValid = checkValidInput(dataInput);
            if (checkValid.isValid === false) {
                resolve({
                    errorCode: 1,
                    errorMessage: `Missing required parameter: ${checkValid.inValidElement}`
                })
            } else {
                if (dataInput.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: dataInput.contentHTML,
                        contentMarkdown: dataInput.contentMarkdown,
                        description: dataInput.description,
                        doctorId: dataInput.doctorId
                    })
                } else if (dataInput.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: dataInput.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = dataInput.contentHTML;
                        doctorMarkdown.contentMarkdown = dataInput.contentMarkdown;
                        doctorMarkdown.description = dataInput.description;
                        doctorMarkdown.updatedAt = new Date();
                        await doctorMarkdown.save();
                    }
                }

                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: { doctorId: dataInput.doctorId },
                    raw: false
                })
                if (doctorInfor) {
                    doctorInfor.doctorId = dataInput.doctorId;
                    doctorInfor.priceId = dataInput.selectedPrice;
                    doctorInfor.paymentId = dataInput.selectedPayment;
                    doctorInfor.provinceId = dataInput.selectedProvince;
                    doctorInfor.nameClinic = dataInput.nameClinic;
                    doctorInfor.addressClinic = dataInput.addressClinic;
                    doctorInfor.note = dataInput.note;
                    doctorInfor.specialtyId = dataInput.selectedSpecialty;
                    doctorInfor.clinicId = dataInput.selectedClinic;

                    await doctorInfor.save();
                } else {
                    await db.Doctor_Infor.create({
                        doctorId: dataInput.doctorId,
                        priceId: dataInput.selectedPrice,
                        paymentId: dataInput.selectedPayment,
                        provinceId: dataInput.selectedProvince,
                        nameClinic: dataInput.nameClinic,
                        addressClinic: dataInput.addressClinic,
                        specialtyId: dataInput.selectedSpecialty,
                        clinicId: dataInput.selectedClinic,
                        note: dataInput.note
                    })
                }

                resolve({
                    errorCode: 0,
                    errorMessage: 'Save info doctor successfully'
                })

            }
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: doctorId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        }
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if (!data) data = {}

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

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arraySchedule || !data.doctorId || !data.formattedDate) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let schedule = data.arraySchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formattedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber']
                })

                if (existing && existing.length > 0) {
                    existing = existing.map(item => {
                        item.date = new Date(Number(item.date)).getTime();
                        return item;
                    })
                }

                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === b.date;
                });

                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                    resolve({
                        errorCode: 0,
                        errorMessage: 'Ok'
                    });
                } else {
                    resolve({
                        errorCode: 1,
                        errorMessage: 'Existing schedule in system !'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] }
                    ],
                    raw: false,
                    nest: true
                })
                if (!dataSchedule) {
                    dataSchedule = []
                }
                resolve({
                    errorCode: 0,
                    data: dataSchedule
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getExtraDoctorInforById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: { doctorId: inputId },
                    attributes: {
                        exclude: ['doctorId', 'id'],
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] }
                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = {}

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

let getProfileDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        }
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if (!data) data = {}

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

let getListBookings = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date,

                    },
                    include: [
                        {
                            model: db.User, as: 'patientData', attributes: ['email', 'firstName', 'address', 'phoneNumber', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        },
                        { model: db.Allcode, as: 'timeData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor, as: 'bookingDoctorData',
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                {
                                    model: db.User,
                                    attributes: {
                                        exclude: ['id', 'email', 'address', 'password', 'phoneNumber', 'gender', 'roleId', 'positionId', 'image', 'createdAt', 'updatedAt']
                                    }
                                }
                            ]
                        }
                    ],
                    raw: false,
                    nest: true
                })
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

let sendReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        statusId: 'S2',
                        timeType: data.timeType
                    },
                    raw: false
                });
                if (appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save();
                }
                await emailService.sendReceiptEmail(data)
                resolve({
                    errorCode: 0,
                    errorMessage: 'Updated status booking successful'
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getHistoryBookings = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S3',
                        doctorId: doctorId,
                        date: date,

                    },
                    include: [
                        {
                            model: db.User, as: 'patientData', attributes: ['email', 'firstName', 'address', 'phoneNumber', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        },
                        { model: db.Allcode, as: 'timeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'statusData', attributes: ['valueEn', 'valueVi'] }
                    ],
                    raw: false,
                    nest: true
                })
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

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    postDoctorInfo: postDoctorInfo,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraDoctorInforById: getExtraDoctorInforById,
    getProfileDoctorById: getProfileDoctorById,
    getListBookings: getListBookings,
    sendReceipt: sendReceipt,
    getHistoryBookings: getHistoryBookings
}