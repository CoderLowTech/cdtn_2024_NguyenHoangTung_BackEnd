import specialtyService from '../services/specialtyService';

let createSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.createSpecialty(req.body);
        return res.status(200).json(infor);
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from server!!!"
        });
    }
}

let getAllSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.getAllSpecialty();
        return res.status(200).json(infor);
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from server!!!"
        });
    }
}

let getDetailSpecialtyById = async (req, res) => {
    try {
        let infor = await specialtyService.getDetailSpecialtyById(req.query.id, req.query.location);
        return res.status(200).json(infor)
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from server!!!"
        })
    }
}

let deleteSpecialty = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errorCode: 1,
                errorMessage: "Missing required parameter"
            })
        }
        else {
            let infor = await specialtyService.deleteSpecialty(req.body.id);
            return res.status(200).json(infor)
        }
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from server!!!"
        })
    }
}

let editSpecialty = async (req, res) => {
    let message = await specialtyService.editSpecialty(req.body);
    return res.status(200).json(message);
}

module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    deleteSpecialty: deleteSpecialty,
    editSpecialty: editSpecialty
}