import patientService from '../services/patientService';

let postBookAppointment = async (req, res) => {
    try {
        let info = await patientService.postBookAppointment(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log('error: ', error);
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

let verifyBookingAppointment = async (req, res) => {
    try {
        let info = await patientService.verifyBookingAppointment(req.body);
        return res.status(200).json(info);
    } catch (error) {
        console.log('error: ', error);
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server...'
        })
    }
}

module.exports = {
    postBookAppointment: postBookAppointment,
    verifyBookingAppointment: verifyBookingAppointment,
}