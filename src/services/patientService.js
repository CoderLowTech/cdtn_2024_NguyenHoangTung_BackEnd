import db from '../models/index';
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';


let buildUrlEmail = (token, doctorId) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email ||
                !data.doctorId ||
                !data.timeType || !data.date || !data.fullName || !data.selectedGender || !data.address || !data.phoneNumber) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {

                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        gender: data.selectedGender,
                        roleId: 'R3',
                        firstName: data.fullName,
                        address: data.address,
                        phoneNumber: data.phoneNumber
                    },
                });

                if (user && user[0]) {
                    let bookingData = await db.Booking.findAll({
                        where: { patientId: user[0].id }
                    })
                    if (bookingData && bookingData.length > 0) {
                        let check = bookingData.every((item) => {
                            return item.statusId === 'S3' && item.statusId !== 'S2' && item.statusId !== 'S1'
                        })
                        if (check === true) {
                            let token = uuidv4();
                            await emailService.sendSimpleEmail({
                                recieverEmail: data.email,
                                patientName: data.fullName,
                                doctorName: data.doctorName,
                                time: data.timeString,
                                language: data.language,
                                redirectLink: buildUrlEmail(token, data.doctorId)
                            })

                            await db.Booking.create({
                                statusId: 'S1',
                                doctorId: data.doctorId,
                                patientId: user[0].id,
                                date: data.date,
                                timeType: data.timeType,
                                token: token
                            })

                            resolve({
                                errorCode: 0,
                                errorMessage: 'Booking appointment successfully'
                            })
                        } else {
                            resolve({
                                errorCode: 1,
                                errorMessage: 'Booking appointment failed'
                            })
                        }
                    } else {
                        let token = uuidv4();
                        await emailService.sendSimpleEmail({
                            recieverEmail: data.email,
                            patientName: data.fullName,
                            doctorName: data.doctorName,
                            time: data.timeString,
                            language: data.language,
                            redirectLink: buildUrlEmail(token, data.doctorId)
                        })

                        await db.Booking.create({
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token
                        })

                        resolve({
                            errorCode: 0,
                            errorMessage: 'Booking appointment successfully'
                        })
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

let verifyBookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errorCode: 1,
                    errorMessage: 'Missing required parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S2'
                    await appointment.save();
                    resolve({
                        errorCode: 0,
                        errorMessage: 'Update appointment status successfully'
                    })
                } else {
                    resolve({
                        errorCode: 2,
                        errorMessage: 'Appointment has been update or does not exist'
                    })
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    postBookAppointment: postBookAppointment,
    verifyBookingAppointment: verifyBookingAppointment,
}