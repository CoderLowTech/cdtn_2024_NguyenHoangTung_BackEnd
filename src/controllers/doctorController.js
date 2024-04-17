import doctorService from '../services/doctorService';

let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;
    try {
        let response = await doctorService.getTopDoctorHome(+limit);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errorCode: -1,
            message: 'Error from server...'
        })
    }
}

let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors()
        return res.status(200).json(doctors)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let postDoctorInfo = async (req, res) => {
    try {
        let response = await doctorService.postDoctorInfo(req.body);
        return res.status(200).json(response)
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let getDetailDoctorById = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(200).json({
                errorCode: 1,
                errorMessage: 'Missing required parameter'
            })
        } else {
            let info = await doctorService.getDetailDoctorById(req.query.id)
            return res.status(200).json(info)
        }
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let bulkCreateSchedule = async (req, res) => {
    try {
        let info = await doctorService.bulkCreateSchedule(req.body);
        return res.status(200).json(info);
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let getScheduleByDate = async (req, res) => {
    try {
        let infor = await doctorService.getScheduleByDate(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let getExtraDoctorInforById = async (req, res) => {
    try {
        if (!req.query.doctorId) {
            return res.status(200).json({
                errorCode: 1,
                errorMessage: 'Missing required parameter'
            })
        } else {
            let infor = await doctorService.getExtraDoctorInforById(req.query.doctorId);
            if (infor) {
                return res.status(200).json(infor);
            } else {
                return res.status(200).json({
                    errorCode: -1,
                    errorMessage: 'Error from server...'
                })
            }
        }
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let getProfileDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getProfileDoctorById(req.query.doctorId);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let getListBookings = async (req, res) => {
    try {
        let infor = await doctorService.getListBookings(req.query.doctorId, req.query.date);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let sendReceipt = async (req, res) => {
    try {
        let infor = await doctorService.sendReceipt(req.body);
        return res.status(200).json(infor)
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
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
    sendReceipt: sendReceipt
}