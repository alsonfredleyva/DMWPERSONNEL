const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dmwrox';

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.replace(/^"|"$/g, '').trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.replace(/^"|"$/g, '').trim());
    return result;
}

function parseBirthdate(dateString) {
    if (!dateString) return null;
    let date = null;
    const dateRegex = /(\w+)\s+(\d{1,2}),\s*(\d{4})/;
    let match = dateString.match(dateRegex);
    if (match) {
        const [, month, day, year] = match;
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        date = new Date(parseInt(year), monthIndex, parseInt(day));
    } else {
        const m = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (m) {
            const [, month, day, year] = m;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }
    if (date && !isNaN(date.getTime())) return date;
    return null;
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    let currentDivision = 'Unassigned';
    let currentType = null;
    const employees = [];

    for (let raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        // Division header
        if ((line.includes('Division') || line.includes('Director')) && line.includes('RO X')) {
            const parts = parseCSVLine(line);
            currentDivision = (parts[0] || '').trim() || currentDivision;
            if (parts.length > 1 && parts[1]) {
                const p = parts[1].trim();
                if (p === 'REGULAR' || p === 'JOB ORDER' || p === 'GIP') currentType = p;
            }
            continue;
        }

        const parts = parseCSVLine(line);
        // employment type markers
        if (parts.length > 1 && (parts[1] === 'REGULAR' || parts[1] === 'JOB ORDER' || parts[1] === 'GIP')) {
            currentType = parts[1];
            continue;
        }

        if (line.includes('First Name') && line.includes('Last Name')) continue;

        // Try to find email index
        let emailIndex = -1;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] && parts[i].includes('@')) { emailIndex = i; break; }
        }

        if (emailIndex >= 0) {
            const firstName = parts[emailIndex - 4] || '';
            const lastName = parts[emailIndex - 3] || '';
            const middleName = parts[emailIndex - 2] || '';
            const mobile = parts[emailIndex - 1] || '';
            const email = parts[emailIndex] || '';
            const position = parts[emailIndex + 1] || '';
            const nickname = parts[emailIndex + 2] || '';
            const birthdateString = parts[emailIndex + 3] || '';
            const address = parts[emailIndex + 4] || '';

            if (firstName && lastName) {
                employees.push({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    middleName: middleName.trim(),
                    mobile: mobile.trim(),
                    email: email.trim(),
                    position: position.trim(),
                    nickname: nickname.trim(),
                    birthdate: parseBirthdate(birthdateString),
                    address: address.trim(),
                    division: currentDivision,
                    employmentType: currentType || 'UNSPECIFIED'
                });
            }
            continue;
        }

        // fallback rows without email
        let filtered = parts;
        if (filtered[0] === '') filtered = filtered.slice(1);
        const firstName = filtered[0] || '';
        const lastName = filtered[1] || '';
        const middleName = filtered[2] || '';
        const mobile = filtered[3] || '';
        const email = filtered[4] || '';
        const position = filtered[5] || '';
        const nickname = filtered[6] || '';
        const birthdateString = filtered[7] || '';
        const address = filtered[8] || '';

        if (firstName && lastName) {
            employees.push({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                middleName: middleName.trim(),
                mobile: mobile.trim(),
                email: email.trim(),
                position: position.trim(),
                nickname: nickname.trim(),
                birthdate: parseBirthdate(birthdateString),
                address: address.trim(),
                division: currentDivision,
                employmentType: currentType || 'UNSPECIFIED'
            });
        }
    }

    return employees;
}

async function run() {
    try {
        try {
            await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Connected to MongoDB for import');
        } catch (err) {
            console.error('Primary connection failed:', err.message);
            const fallback = 'mongodb://127.0.0.1:27017/dmwrox';
            console.log('Trying local fallback:', fallback);
            await mongoose.connect(fallback, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Connected to local MongoDB for import');
        }

        const csvPath = path.join(__dirname, '..', 'Data', 'ROX INFO(Info) (1).csv');
        const csvText = fs.readFileSync(csvPath, 'utf8');
        const employees = parseCSV(csvText);
        console.log('Parsed employees count:', employees.length);

        // Clear collection and insert
        await Employee.deleteMany({});
        const docs = employees.map(e => ({
            firstName: e.firstName,
            lastName: e.lastName,
            middleName: e.middleName,
            mobile: e.mobile,
            email: e.email,
            position: e.position,
            nickname: e.nickname,
            birthdate: e.birthdate || undefined,
            address: e.address,
            division: e.division,
            employmentType: e.employmentType
        }));

        if (docs.length === 0) {
            console.log('No documents to insert. Exiting.');
            process.exit(0);
        }

        const inserted = await Employee.insertMany(docs, { ordered: false });
        console.log('Inserted documents:', inserted.length);
        process.exit(0);
    } catch (err) {
        console.error('Import error:', err.message || err);
        process.exit(1);
    }
}

run();
