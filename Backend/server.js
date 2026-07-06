const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Employee = require('./models/Employee');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dmwrox';

const usingAtlas = mongoUri.startsWith('mongodb+srv://');
console.log(`Using ${usingAtlas ? 'Atlas' : 'local'} MongoDB URI`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// MongoDB connection with local fallback
async function connectWithFallback(uri) {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        const fallback = 'mongodb://127.0.0.1:27017/dmwrox';
        if (uri !== fallback) {
            console.log('Attempting fallback to local MongoDB');
            try {
                await mongoose.connect(fallback, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log('MongoDB connected (local fallback)');
            } catch (err2) {
                console.error('Fallback connection failed:', err2.message);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'DMW ROX Personnel API' });
});

// CRUD routes for personnel
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find().sort({ lastName: 1, firstName: 1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

app.post('/api/employees', async (req, res) => {
    const { firstName, lastName, middleName, mobile, email, position, nickname, birthdate, address, division, employmentType } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
    }

    try {
        const employee = new Employee({
            firstName,
            lastName,
            middleName,
            mobile,
            email,
            position,
            nickname,
            birthdate: birthdate ? new Date(birthdate) : undefined,
            address,
            division,
            employmentType
        });
        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                birthdate: req.body.birthdate ? new Date(req.body.birthdate) : undefined
            },
            { new: true, runValidators: true }
        );

        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Serve SPA fallback for non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

async function startServer() {
    await connectWithFallback(mongoUri);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer().catch((err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
