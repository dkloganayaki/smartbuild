const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dkloganayaki132@gmail.com', 
    pass: 'eoab aiaj jgse qclj', 
  },
});

module.exports = transporter;
