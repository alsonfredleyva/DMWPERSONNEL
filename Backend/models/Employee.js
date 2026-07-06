const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    position: { type: String, default: '' },
    nickname: { type: String, default: '' },
    birthdate: { type: Date },
    address: { type: String, default: '' },
    division: { type: String, default: '' },
    employmentType: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', EmployeeSchema);
