import userService from '../services/userService';

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if(!email || !password){
        return res.status(500).json({
            errorCode: 1,
            message: 'Missing email or password'
        });
    }
    let userData = await userService.handleUserLogin(email, password);
    return res.status(200).json({
       errorCode: userData.errorCode,
       message: userData.message,
       user: userData.user ? userData.user : {}
    });
}

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id;
    if(!id){
        return res.status(200).json({
            errorCode: 1,
            errorMessage: 'Missing required parameters',
            users:[]
        })
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errorCode: 0,
        errorMessage: 'Ok',
        users
    })

}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => {
    let message = await userService.editUser(req.body);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) => {
    if(!req.body.id){
        res.status(200).json({
            errorCode: 1,
            errorMessage: 'Missing required parameters'
        });
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let handleGetAllcode = async (req, res) => {
    try {
        let data = await userService.getAllcode(req.query.type);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errorCode: -1,
            errorMessage: 'Error from server'
        })
    }
}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    handleGetAllcode: handleGetAllcode,
}