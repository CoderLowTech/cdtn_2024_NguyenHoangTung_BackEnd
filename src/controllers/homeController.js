import db from '../models/index';
import CRUDService from '../services/CRUDService';

let getHomePage = async (req, res) =>{
    try {
        let data = await db.User.findAll();
        return res.render('homePage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (error) {
        console.log(error);
    }
   
}

let getCRUD = async (req, res) =>{
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) =>{
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('post crud');
}

let displayGetCRUD = async (req, res) =>{
    let data = await CRUDService.getAllUsers();
    return res.render('displayCRUD.ejs',{userData:data});
}

let editCRUD = async (req, res) =>{
    let userId = req.query.id;
    if(userId){
        let userData = await CRUDService.getUserDataById(userId);
        return res.render('editCRUD.ejs',{userData:userData});
    }else{
        return res.send('User not found');
    }
}

let putCRUD = async (req, res) =>{
    let userData = req.body;
    let allUsers = await CRUDService.updateUserData(userData);
    return res.render('displayCRUD.ejs',{userData:allUsers});
}

let deleteCRUD = async (req, res) =>{
    let userId = req.query.id;
    if(userId){
        await CRUDService.deleteUserById(userId);
        return res.send('User deleted successfully');
    }else{
        return res.send('User not found');
    }
}

module.exports = {
    getHomePage: getHomePage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    editCRUD: editCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD
}