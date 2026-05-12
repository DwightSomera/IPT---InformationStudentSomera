const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
	{
		idNumber: { type: String, required: true, unique: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		middleName: { type: String, default: '' },
		course: { type: String, required: true },
		yearLevel: { type: String, required: true },
		photoPath: { type: String, required: true },
	},
	{
		collection: 'student-data',
		timestamps: true,
	}
);

module.exports = mongoose.model('Student', StudentSchema);
