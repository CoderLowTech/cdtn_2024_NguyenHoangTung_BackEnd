require('dotenv').config();
import nodemailer from 'nodemailer';
import moment from 'moment';

let sendSimpleEmail = async (sendData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // Use `true` for port 465, `false` for all other ports
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            let info = await transporter.sendMail({
                from: '"BookingCare " <nhtung76002@gmail.com>', // sender address
                to: sendData.recieverEmail, // list of receivers
                subject: "Thông tin đặt lịch khám bệnh", // Subject line
                html: getBodyEmailHTML(sendData),
            });


            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

let getBodyEmailHTML = (sendData) => {
    let result = '';
    if (sendData.language === 'vi') {
        result =
            `
            <h3>Xin chào ${sendData.patientName}</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên website của chúng tôi.</p>
            <p>Thông tin đặt lịch khám bệnh:</p>
            <div><b>Thời gian: ${sendData.time}</b></div>
            <div><b>Bác sĩ: ${sendData.doctorName}</b></div>
            <p>Nếu các thông tin trên là đúng sự thật, vui lòng nhấn vào đường link bên dưới để hoàn tất thủ tục đặt lịch khám bệnh.</p>
            <div>
                <a href=${sendData.redirectLink} target="_blank">Nhấn vào đây</a>
            </div>
            <div>Xin chân thành cảm ơn</div>
        `
    }
    if (sendData.language === 'en') {
        result =
            `
            <h3>Dear ${sendData.patientName}</h3>
            <p>You received this email because you booked an online medical appointment on our website.</p>
            <p>Information for scheduling medical examination:</p>
            <div><b>Time: ${sendData.time}</b></div>
            <div><b>Doctor: ${sendData.doctorName}</b></div>
            <p>If the above information is true, please click on the link below to complete the medical examination appointment procedure.</p>
            <div>
                <a href=${sendData.redirectLink} target="_blank">Click here</a>
            </div>
            <div>Sincerely thank</div>
        `
    }

    return result;
}

let sendReceiptEmail = async (sendData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // Use `true` for port 465, `false` for all other ports
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            let info = await transporter.sendMail({
                from: '"BookingCare " <nhtung76002@gmail.com>', // sender address
                to: sendData.email, // list of receivers
                subject: "Hóa đơn khám bệnh", // Subject line
                html: getReceiptBodyEmailHTML(sendData),
            });

            resolve();

        } catch (error) {
            reject(error);
        }
    })
}


let getReceiptBodyEmailHTML = (sendData) => {
    let timeVn = sendData.time.valueVi;
    let timeEn = sendData.time.valueEn;
    let dateVn = moment.unix(+sendData.date / 1000).locale('vi').format('dddd - DD/MM/YYYY');
    let dateEn = moment.unix(+sendData.date / 1000).locale('en').format('ddd - MM/DD/YYYY');
    let priceVn = sendData.price.valueVi;
    let priceEn = sendData.price.valueEn;
    let result = '';
    if (sendData.language === 'vi') {
        result =
            `
            <h3>Xin chào ${sendData.patientName}</h3>
            <p>Bạn nhận được email này vì đã khám bệnh tại phòng khám của chúng tôi.</p>
            <p>Thông tin hóa đơn</p>
            <p>Bác sĩ: <strong>${sendData.doctorLastName} ${sendData.doctorFirstName}</strong></p>
            <p>Thời gian: <strong>${timeVn} - ${dateVn}</strong></p>
            <p>Phí khám bệnh: <strong>${priceVn} VNĐ</strong></p>
            <div>Xin chân thành cảm ơn</div>
        `
    }
    if (sendData.language === 'en') {
        result =
            `
            <h3>Dear ${sendData.patientName}</h3>
            <p>You are receiving this email because you were examined at our clinic.</p>
            <p>Receipt information</p>
            <p>Doctor: <strong>${sendData.doctorFirstName} ${sendData.doctorLastName}</strong></p>
            <p>Time: <strong>${timeEn} - ${dateEn}</strong></p>
            <p>Examination fee: <strong>${priceEn} USD</strong></p>
            <div>Sincerely thank</div>
        `
    }

    return result;
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendReceiptEmail: sendReceiptEmail
}