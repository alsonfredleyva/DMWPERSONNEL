// Birthday Tracker Application
class BirthdayTracker {
    constructor() {
        this.apiBaseUrl = '/api';
        this.employees = [];
        this.divisions = new Map();
        this.employeeDetails = new Map();
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.pendingDeleteId = null;
        this.init();
    }

    async init() {
        console.log('Initializing Birthday Tracker...');
        this.statusElement = document.getElementById('backend-status-banner');
        await this.loadEmployees();
        console.log('Employees loaded, employees:', this.employees.length);
        this.setupEventListeners();
        console.log('Event listeners setup');
        this.renderDashboard();
        console.log('Dashboard rendered');
        this.renderCalendar();
        console.log('Calendar rendered');
        this.renderDivisions();
        console.log('Divisions rendered');
    }

    async loadEmployees() {
        try {
            await this.fetchEmployeesFromApi();
        } catch (error) {
            console.warn('API fetch failed, falling back to CSV parser:', error);
            const message = error && error.message ? error.message : String(error);
            this.setBackendStatus(false, `Backend unavailable — using offline CSV mode (${message})`);
            await this.loadAndParseCSV();
            return;
        }
        this.setBackendStatus(true, 'Connected to backend API');
    }

    async fetchEmployeesFromApi() {
        const response = await fetch(`${this.apiBaseUrl}/employees`);
        if (!response.ok) {
            throw new Error(`Failed to load employees from API: ${response.status} ${response.statusText}`);
        }

        const employees = await response.json();
        this.processEmployeeData(employees);
    }

    setBackendStatus(isOnline, message) {
        if (!this.statusElement) return;
        this.statusElement.textContent = message;
        this.statusElement.classList.remove('hidden', 'online', 'offline');
        this.statusElement.classList.add(isOnline ? 'online' : 'offline');
    }

    clearBackendStatus() {
        if (!this.statusElement) return;
        this.statusElement.classList.add('hidden');
        this.statusElement.textContent = '';
    }

    processEmployeeData(employees) {
        this.employees = [];
        this.divisions.clear();

        employees.forEach(emp => {
            const birthDate = emp.birthdate ? new Date(emp.birthdate) : null;
            const displayBirthday = birthDate && !isNaN(birthDate.getTime())
                ? this.formatBirthday(birthDate)
                : 'No Date';

            const employee = {
                ...emp,
                birthDate,
                displayBirthday,
                birthdateString: emp.birthdate || ''
            };

            this.employees.push(employee);
            const division = employee.division && employee.division.trim() ? employee.division : 'Unassigned';
            if (!this.divisions.has(division)) {
                this.divisions.set(division, []);
            }
            this.divisions.get(division).push(employee);
        });

        this.sortEmployees();
    }

    sortEmployees() {
        this.employees.sort((a, b) => {
            if (a.division !== b.division) {
                return a.division.localeCompare(b.division);
            }
            if (a.lastName !== b.lastName) {
                return a.lastName.localeCompare(b.lastName);
            }
            return a.firstName.localeCompare(b.firstName);
        });

        for (const [division, employees] of this.divisions.entries()) {
            employees.sort((a, b) => {
                if (a.lastName !== b.lastName) {
                    return a.lastName.localeCompare(b.lastName);
                }
                return a.firstName.localeCompare(b.firstName);
            });
        }
    }

    async loadAndParseCSV() {
        try {
            // First try to fetch the file
            try {
                const response = await fetch('ROX INFO(Info) (1).csv');
                if (response.ok) {
                    const csvText = await response.text();
                    this.parseCSV(csvText);
                    return;
                }
            } catch (fetchError) {
                console.log('Fetch failed, using embedded data...');
            }

            // If fetch fails, use embedded data
            const csvText = this.getEmbeddedCSVData();
            this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading CSV:', error);
            this.showNotification('Error loading CSV data.', 'error');
        }
    }

    getEmbeddedCSVData() {
        return `DMW ROX,,,,,,,,,,,
,,,,,,,,,,,
DMW ROX DIVISIONS ,,,,,,,,,,,
Office of the Regional Director - Regional Office No. 10 (RO X),REGULAR,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Emmanuel,Toledo,Galleto,0915-972-6247,dmw10.emmanueltoledo@gmail.com,OIC RD,Maning,"April 23, 1969","La Mirande Crest, Lumbia, CDOC",,
,Vanessa,Cepeda,Monteza,0965-400-6441,vanesacepeda.work@gmail.com,AAIII- ,Van,"June 3, 2001",1631 Ayesa Bontong Camaman-an CDO,,
,Alberto Jr.,Agua,Bulawit,0953-385-2750,albertoagua2020@gmail.com,AA IV,Bert,"July 18, 1986","#20 Everlasting, Ilaya St. Carmen, CDOC",,
,Caryn Rose,Salinas,Escobido,0917-565-6956,caryn.salinas@dmw.gov.ph,Supervising LEO,Caryn,"January 9, 1989","44-A, Serina Street, Carmen, CDO",,
,,,,,,,,,,,
,JOB ORDER,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,John Denver,Salvania,Guinawat,0960-280-2946,johndenversalvania13@gmail.com,ORD- IT,JD,"April 13, 1997","Brgy 22, CDOC",,
,Florante Jr,Quimson,Sabuero,0965-196-2368,quimsonflorantes08@gmail.com,AA II,Gie,"December 21, 2000","Carmen, CDOC",,
,,,,,,,,,,,
,GIP,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Leanna,Ua-o,,,,,,,,,
,Christian Jan,Escol,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
Finance and Administrative Division (RO X),REGULAR,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Matt Anthony,Pareja,Mulaan,0938-480-3200,mattanthonypareja@gmail.com,Chief Admin Officer,Matt,"March 4, 1987","Kauswagan, CDOC",,
,Hannah Marie,Maulion,Arreza,0917-623-9766,hannahmariemaulion@gmail.com,Supervising Admin Officer,Hannah,"July 29, 1996","B22-L12 Lessandra, Gran Europa, Lumbia, CDOC",,
,Janice ,Beating,Bodiongan,0963-938-9665,jbeatsu@gmail.com,Accountant III,Jan,"July 2, 1986","San Agustin, Agora, Lapasan, CDO",,
,Jermelyn,Dacula,Daraman,0935-868-0580,jermelyn.dacula@dmw.gov.ph,HRMO III,Jerms,"June 11, 1997","Bulua, CDOC",,
,Alanisah,Macagaan,Datu,0935-868-0580,alanisah.macagaan@dmw.gov.ph,Budget Officer II,Al,"April 4, 1984","B7-L5, Dona Cecilia St., Sta. Cecilia Village, Gusa, CDOC",,
,Nashimah,Guro,Pitiilan,0963-052-6378,guro.pitiilan@dmw.gov.ph,Records Officer II,Nash,"July 26, 1993","Riverside, Mcabalan, CDOC",,
,Pardise,Mimbantas,Amerol,0963-936-5336,pardise.dmw@gmail.com,Supply Officer I,Pards,"March 26, 1994","B16- L37, Villa Angela Subd., Balulang, CDOC",,
,Cindy,Babanto,Gultiano,0935-035-7475,cynzbabanto329@gmail.com,LEO II,Cynz,"March 17, 1991","Balulang, CDOC",,
,,,,,,,,,,,
,JOB ORDER,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Nel Marie,Dayham,Maglangit,0926-687-2699,nelmariedayham75@gmail.com,AA III,Nel,"April 17, 2000","Carmen, CDOC",,
,Amroding,Mocali,Pundaodaya,0930-026-5502,apmocali.dmr10@gmail.com,AA II,Rodz,"July 1, 1985","Macabalan, CDOC",,
,,,,,,,,,,,
,GIP,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Jay Emerald,Chaves,,,,,,,,,
,Alson Fred,Leyva,,,,,,,,,
,Julieta,Panga,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
Migrant Workers Processing Division (RO X),REGULAR,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Anna Liza,Tiglao,Vega,0947-033-2146,anna.tiglao@dmw.gov.ph,Chief LEO ,Liza,"July 2, 1972","Zone 6, Careteras, Bonbon, CDOC",,
,Maria Edralyn,Tenajeros,Mangayan,0991-329-7203,maria.tenajeros@dmw.gov.ph,Supervising LEO,Eda,"September 5, 1987","Zone 1, Sinaloc, El Salvador, Mis.Or",,
,Mary Claire,Zalsos,Patino,0912-914-2207,mary.patino@dmw.gov.ph,Senior LEO,Claire,"December 9, 1996","Lumbia, CDOC",,
,Alnirah,Alikan,Ongca,0997-291-7534,alnirahalikan951201@gmail.com,LEO III,Alex,"December 1, 1994","B13-L4, Vamenta Subd. Barra, Opol Mis.Or",,
,Vince Kenneth,Ramos,Miranda,0975-637-9230,vinkenramos22@gmail.com,LEO I,Ken,"April 5, 1997","162 Centro Kolambog, Lapasan, CDOC",,
,Nassria,Liwalug,Adiar,0960-931-5657,nassria.liwalug@dmw.gov.ph,LEO I,Neshreen,"November 11, 2000",,,
,,,,,,,,,,,
,JOB ORDER,,,,,,,,,,
,Judy Ann,Fuentes,Lequen,0945-894-8393,judyannlequen21@gmail.com,AA II,Dian,"June 28, 1996","Camaman-an, CDOC",,
,,,,,,,,,,,
,GIP,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Kittim,Ignalig,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
Migrant Workers Protection Division (RO X),REGULAR,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Michael Thomas,Arao,Sanchez,0915-302-9021,michaelarao.cdo@gmail.com,OIC ARD,Mike,"April 22, 1992","Dr 6, 3F, Paladio Bldg, Edrote St., Macasandig, CDOC",,
,Francis Andrew,Paduganan,Opamin,0916-751-6380,dmw10.attyfaop@gmail.com,Attorney IV,Dodie,"November 13, 1986","Xavier Estates, Balulang, CDO",,
,Sorayda,Rangiris,Macato-on,0999-992-9711,aydzmrangiris@gmail.com,Senior LEO,Aydz,"January 9, 1975","Hayes St., Nazareth, CDOC",,
,Justine Jane,Montilla,Maaba,0915-290-2431,jjanemontilla@gmail.com,LEO III,Jus,"June 3, 1995","Dr 1, Luna-Tiano St., Brgy 19, CDOC",,
,Norol-Iman,Mocali,Ibrahim,0930-196-1243,noroliman.mocali@gmail.com,LEO III,Iman,"February 14, 1989","Macabalan, CDOC",,
,Anna Lorens,Romagos,,0975-908-6547,annaromagos5@gmail.com,LEO II,Anna,"April 17, 1999","Zone 2, Menai, Molugan, El Salvador City",,
,Ritchel,Ramos,Carrasco,0936-196-7268,ritchel.ramos@dmw.gov.ph,LEO I,Ritch,"October 30, 1996",,,
,Jumelyn,Aluyen,Labadan,0952-470-6944,aluyenjumelyn@gmail.com,LEO I,Jums,"August 25, 2001","SBR Compound, Balulang, CDOC",,
,,,,,,,,,,,
,JOB ORDER,,,,,,,,,,
,Sophia Jo Carmella,Maglasang,Zamayla,0975-046-8703,szamayla2@gmail.com,,Sophia,"July 15, 2003","Brgy 22, CDOC",,
,,,,,,,,,,,
,GIP,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Christian ,Noynay,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
,,,,,,,,,,,
Welfare Reintegration Services Division (RO X),REGULAR,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Marry Gil,Damasing-Palisbo,Alfante,0917-839-2199,mary.damasing@dmw.gov.ph,Chief LEO,Mary,"June 13, 1987","B11-L53, Lumina, Gran Europa, Lumbia, CDOC",,
,Caryn Rose,Salinas,Escobido,0917-565-6956,caryn.salinas@dmw.gov.ph,Supervising LEO,Caryn,"January 9, 1989","44-A, Serina Street, Carmen, CDO",,
,Gerardo Antonio,Cano,Pizarro,0917-153-2308,gerardo.cano@dmw.gov.ph,Senior LEO,GA,"February 8, 1984","Palmera Drive, Tibasak, Macasandig, CDOC",,
,Juniel,Ravelo,Bangot,0906-611-0227,junielravelo1@gmail.com,LEO II,Jun,"April 22, 1998","Purok 13, Tablon, CDOC",,
,Rovy Marie,Dagpin,Capalac,0966-051-1334,yvorrdagpin26@gmail.com,LEO II,yvorr,"February 13, 1997","B14-L2, Manuel Vega St, Consoville Subd, Consolacion, CDOC",,
,Nafidah,Marandang,Masacal,0965-108-3743,nafidah.marandang.dmwrox@gmail.com,LEO I,Fhida,"October 28, 1999","0759 J. Pacana Street, Macabalan, Cagayan de Oro City",,
,Naila,Moctar,Macauyag,0905-3112-0581,nallia.moctar@dmw.gov.ph,LEO I,Naila,"September 25, 1996","B6-L34, Villa Angela, Balulang, CDOC",,
,,,,,,,,,,,
,JOB ORDER,,,,,,,,,,
,,,,,,,,,,,
,GIP,,,,,,,,,,
,First Name,Last Name,Middle Name,Mobile Number/Contact Number,Email,Position,Nickname,Birthdate,Address,,
,Nathalie Grace,Amora,,,,,,,,,
,Abdul Ghaffour,Lawansa,,,,,,,,,`;
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        let currentDivision = 'Unassigned';
        let currentType = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines
            if (!line) continue;

            // Check for division headers (they contain "Division" or "Director")
            if ((line.includes('Division') || line.includes('Director')) && line.includes('RO X')) {
                const parts = this.parseCSVLine(line);
                currentDivision = (parts[0] || '').trim();
                
                // Extract employment type from division line if present (column 2)
                if (parts.length > 1 && parts[1]) {
                    const potentialType = (parts[1] || '').trim();
                    if (potentialType === 'REGULAR' || potentialType === 'JOB ORDER' || potentialType === 'GIP') {
                        currentType = potentialType;
                    }
                }
                
                if (!this.divisions.has(currentDivision)) {
                    this.divisions.set(currentDivision, []);
                }
                console.log('Set division to:', currentDivision, 'Type:', currentType);
                continue;
            }

            // Check for employment type markers (lines that start with comma then type, like ",JOB ORDER,,,")
            const parts = this.parseCSVLine(line);
            if (parts.length > 0) {
                // Check second element (after leading empty) for employment type
                let typeStr = null;
                if (parts.length > 1 && parts[1] && !parts[1].includes('@')) {
                    typeStr = parts[1].trim();
                } else if (parts.length > 0 && parts[0] && !parts[0].includes('@')) {
                    typeStr = parts[0].trim();
                }
                
                if (typeStr === 'REGULAR') {
                    currentType = 'REGULAR';
                    console.log('Set employment type to: REGULAR');
                    continue;
                }
                if (typeStr === 'JOB ORDER') {
                    currentType = 'JOB ORDER';
                    console.log('Set employment type to: JOB ORDER');
                    continue;
                }
                if (typeStr === 'GIP') {
                    currentType = 'GIP';
                    console.log('Set employment type to: GIP');
                    continue;
                }
            }

            // Skip header rows
            if (line.includes('First Name') && line.includes('Last Name')) {
                console.log('Skipping header row');
                continue;
            }

            // Parse employee data - look for email as indicator OR for GIP employees without email
            if (line.includes('@gmail.com') || line.includes('@dmw.gov.ph')) {
                const parts = this.parseCSVLine(line);
                
                // Find email position
                let emailIndex = -1;
                for (let j = 0; j < parts.length; j++) {
                    if (parts[j].includes('@')) {
                        emailIndex = j;
                        break;
                    }
                }
                
                if (emailIndex >= 0 && emailIndex < parts.length) {
                    // Extract fields based on email position
                    let firstName = '', lastName = '', middleName = '', mobile = '';
                    let position = '', nickname = '', birthdateString = '', address = '';
                    
                    // Fields before email (in expected order)
                    if (emailIndex >= 1) firstName = (parts[emailIndex - 4] || '').trim();
                    if (emailIndex >= 2) lastName = (parts[emailIndex - 3] || '').trim();
                    if (emailIndex >= 3) middleName = (parts[emailIndex - 2] || '').trim();
                    if (emailIndex >= 4) mobile = (parts[emailIndex - 1] || '').trim();
                    
                    // Email
                    const email = parts[emailIndex].trim();
                    
                    // Fields after email
                    if (emailIndex + 1 < parts.length) position = (parts[emailIndex + 1] || '').trim();
                    if (emailIndex + 2 < parts.length) nickname = (parts[emailIndex + 2] || '').trim();
                    if (emailIndex + 3 < parts.length) birthdateString = (parts[emailIndex + 3] || '').trim();
                    if (emailIndex + 4 < parts.length) address = (parts[emailIndex + 4] || '').trim();

                    // Validate required fields
                    if (!firstName || !lastName) {
                        console.log('Skipping employee - missing name fields:', firstName, lastName, birthdateString);
                        continue;
                    }

                    // Ensure division is valid
                    if (!currentDivision || currentDivision === 'null') {
                        currentDivision = 'Unassigned';
                    }

                    // Use current type, don't default
                    let employmentType = currentType || 'UNSPECIFIED';

                    const employee = {
                        firstName: firstName,
                        lastName: lastName,
                        middleName: middleName,
                        mobile: mobile,
                        email: email,
                        position: position,
                        nickname: nickname,
                        birthdateString: birthdateString,
                        address: address,
                        division: currentDivision,
                        employmentType: employmentType
                    };

                    // Parse birthdate
                    const birthDate = this.parseBirthdate(birthdateString);
                    if (birthDate) {
                        employee.birthDate = birthDate;
                        employee.displayBirthday = this.formatBirthday(birthDate);
                        this.employees.push(employee);
                        console.log('Added employee:', employee.firstName, employee.lastName, 'Type:', employmentType, 'Birthday:', employee.displayBirthday);

                        // Add to division
                        if (this.divisions.has(currentDivision)) {
                            this.divisions.get(currentDivision).push(employee);
                        } else {
                            // Create division if it doesn't exist
                            this.divisions.set(currentDivision, [employee]);
                        }
                    }
                }
            } else if (currentType && line.length > 0 && !line.includes('First Name')) {
                const parts = this.parseCSVLine(line);
                
                // Skip section markers and invalid rows
                if (parts.length === 0) continue;
                const firstCell = (parts[0] || '').trim().toUpperCase();
                if (firstCell === 'REGULAR' || firstCell === 'JOB ORDER' || firstCell === 'GIP' || firstCell === 'DIVISION') {
                    continue;
                }

                // Normalize leading comma rows
                let filteredParts = parts;
                if (filteredParts[0] === '') {
                    filteredParts = filteredParts.slice(1);
                }

                const firstName = (filteredParts[0] || '').trim();
                const lastName = (filteredParts[1] || '').trim();
                const middleName = (filteredParts[2] || '').trim();
                const mobile = (filteredParts[3] || '').trim();
                const email = (filteredParts[4] || '').trim();
                const position = (filteredParts[5] || '').trim();
                const nickname = (filteredParts[6] || '').trim();
                const birthdateString = (filteredParts[7] || '').trim();
                const address = (filteredParts[8] || '').trim();

                if (firstName && lastName) {
                    // Use current employment type when available
                    const employee = {
                        firstName: firstName,
                        lastName: lastName,
                        middleName: middleName,
                        mobile: mobile,
                        email: email,
                        position: position,
                        nickname: nickname,
                        birthdateString: birthdateString,
                        address: address,
                        division: currentDivision,
                        employmentType: currentType || 'UNSPECIFIED'
                    };

                    if (birthdateString) {
                        const birthDate = this.parseBirthdate(birthdateString);
                        if (birthDate) {
                            employee.birthDate = birthDate;
                            employee.displayBirthday = this.formatBirthday(birthDate);
                        } else {
                            employee.displayBirthday = 'No Date';
                        }
                    } else {
                        employee.displayBirthday = 'No Date';
                    }

                    this.employees.push(employee);
                    console.log('Added employee without email:', employee.firstName, employee.lastName, 'Type:', employee.employmentType);

                    if (this.divisions.has(currentDivision)) {
                        this.divisions.get(currentDivision).push(employee);
                    } else {
                        this.divisions.set(currentDivision, [employee]);
                    }
                }
            }
        }

        // Remove the "null" or "undefined" divisions
        if (this.divisions.has('null')) {
            this.divisions.delete('null');
        }
        if (this.divisions.has('undefined')) {
            this.divisions.delete('undefined');
        }

        // Sort employees by upcoming birthday (those without birthdate go to the end)
        this.employees.sort((a, b) => {
            if (!a.birthDate && !b.birthDate) return 0;
            if (!a.birthDate) return 1;
            if (!b.birthDate) return -1;
            return this.daysToBirthday(a.birthDate) - this.daysToBirthday(b.birthDate);
        });
        console.log('Total employees loaded:', this.employees.length);
        console.log('Divisions:', Array.from(this.divisions.keys()));
        console.log('Employees by type:', {
            REGULAR: this.employees.filter(e => e.employmentType === 'REGULAR').length,
            JOB_ORDER: this.employees.filter(e => e.employmentType === 'JOB ORDER').length,
            GIP: this.employees.filter(e => e.employmentType === 'GIP').length
        });
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.replace(/^"|"$/g, ''));
        return result;
    }

    parseBirthdate(dateString) {
        if (!dateString || dateString.length === 0) return null;
        
        let date = null;
        
        // Try format: "April 23, 1969"
        let dateRegex = /(\w+)\s+(\d{1,2}),\s+(\d{4})/;
        let match = dateString.match(dateRegex);
        
        if (match) {
            const [, month, day, year] = match;
            const monthIndex = new Date(`${month} 1, 2000`).getMonth();
            date = new Date(parseInt(year), monthIndex, parseInt(day));
        } else {
            // Try format: "10/30/1996" or "MM/DD/YYYY"
            dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
            match = dateString.match(dateRegex);
            if (match) {
                const [, month, day, year] = match;
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
        }
        
        // Validate date
        if (date && !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2030) {
            return date;
        }
        
        return null;
    }

    formatBirthday(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    daysToBirthday(birthDate) {
        if (!birthDate) return 999999; // Put employees without birthdate at the end
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Create birthday for this year
        let thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday has passed this year, use next year's
        if (thisYearBirthday < today) {
            thisYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
        }
        
        const daysUntil = Math.floor((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        return daysUntil;
    }

    isBirthdayToday(employee) {
        if (!employee.birthDate) return false;
        const today = new Date();
        const bday = employee.birthDate;
        return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
    }

    isBirthdayThisWeek(employee) {
        if (!employee.birthDate) return false;
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        
        const days = this.daysToBirthday(employee.birthDate);
        return days >= 0 && days <= 7;
    }

    isBirthdayThisMonth(employee) {
        if (!employee.birthDate) return false;
        const today = new Date();
        const bday = employee.birthDate;
        
        // Create birthday for this year/month
        let thisYearBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        
        // If birthday has passed, check next occurrence
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        if (thisYearBirthday.getMonth() === today.getMonth() && thisYearBirthday >= today) {
            return true;
        }
        
        return false;
    }

    showEmployeeModal(employee) {
        const modal = document.getElementById('employee-modal');
        const content = document.getElementById('employee-modal-content');
        if (!modal || !content || !employee) return;

        const initials = `${(employee.firstName || 'U').charAt(0)}${(employee.lastName || 'S').charAt(0)}`.toUpperCase();
        const email = employee.email ? `<a href="mailto:${employee.email}">${employee.email}</a>` : 'N/A';
        const mobile = employee.mobile ? `<a href="tel:${employee.mobile}">${employee.mobile}</a>` : 'N/A';
        const address = employee.address || 'N/A';
        const nickname = employee.nickname || 'N/A';

        content.innerHTML = `
            <div class="employee-modal-header">
                <div class="employee-modal-avatar">${initials}</div>
                <div>
                    <h3 id="employee-modal-title">${employee.firstName} ${employee.lastName}</h3>
                    <p>${employee.position || 'N/A'}</p>
                </div>
            </div>
            <div class="employee-modal-grid">
                <div class="employee-modal-item">
                    <h4>Full Name</h4>
                    <p>${employee.firstName} ${employee.lastName}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Middle Name</h4>
                    <p>${employee.middleName || 'N/A'}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Nickname</h4>
                    <p>${nickname}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Birthday</h4>
                    <p>${employee.displayBirthday || 'No Date'}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Email</h4>
                    <p>${email}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Mobile</h4>
                    <p>${mobile}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Address</h4>
                    <p>${address}</p>
                </div>
                <div class="employee-modal-item">
                    <h4>Employment Type</h4>
                    <p><span class="employment-type-badge">${employee.employmentType || 'N/A'}</span></p>
                </div>
                <div class="employee-modal-item">
                    <h4>Division</h4>
                    <p>${employee.division || 'N/A'}</p>
                </div>
            </div>
            <div class="employee-modal-actions">
                <button class="primary-btn edit-employee-btn" data-employee-id="${employee._id}">Edit</button>
                <button class="secondary-btn delete-employee-btn" data-employee-id="${employee._id}">Delete</button>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    closeEmployeeModal() {
        const modal = document.getElementById('employee-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    openConfirmModal(employeeId) {
        this.pendingDeleteId = employeeId;
        const confirmModal = document.getElementById('confirm-modal');
        if (!confirmModal) return;
        confirmModal.classList.remove('hidden');
        confirmModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    closeConfirmModal() {
        const confirmModal = document.getElementById('confirm-modal');
        if (!confirmModal) return;
        confirmModal.classList.add('hidden');
        confirmModal.setAttribute('aria-hidden', 'true');
        this.pendingDeleteId = null;
        document.body.classList.remove('modal-open');
    }

    exportEmployeesToXLS() {
        if (!this.employees || this.employees.length === 0) {
            this.showNotification('No employees available to export.', 'warning');
            return;
        }

        const headers = [
            'ID',
            'First Name',
            'Last Name',
            'Middle Name',
            'Nickname',
            'Email',
            'Mobile',
            'Position',
            'Division',
            'Employment Type',
            'Birthdate',
            'Address'
        ];

        const rows = this.employees.map(emp => [
            emp._id || '',
            emp.firstName || '',
            emp.lastName || '',
            emp.middleName || '',
            emp.nickname || '',
            emp.email || '',
            emp.mobile || '',
            emp.position || '',
            emp.division || '',
            emp.employmentType || '',
            emp.birthdateString || '',
            emp.address || ''
        ]);

        const tableRows = [headers, ...rows].map(row => `
            <tr>${row.map(cell => `<td>${this.escapeExcelCell(cell)}</td>`).join('')}</tr>`
        ).join('');

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="UTF-8">
                    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Employees</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                </head>
                <body>
                    <table border="1" cellspacing="0" cellpadding="5">
                        ${tableRows}
                    </table>
                </body>
            </html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'dmw-rox-employees.xls';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        this.showNotification('Employee data exported to XLS.', 'success');
    }

    escapeExcelCell(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    openEmployeeForm(employee = null) {
        const formModal = document.getElementById('employee-form-modal');
        const formTitle = document.getElementById('employee-form-title');
        if (!formModal || !formTitle) return;

        this.resetEmployeeForm();
        if (employee && employee._id) {
            formTitle.textContent = 'Edit Employee';
            this.populateEmployeeForm(employee);
        } else {
            formTitle.textContent = 'Add Employee';
        }

        formModal.classList.remove('hidden');
        formModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    closeEmployeeForm() {
        const formModal = document.getElementById('employee-form-modal');
        if (!formModal) return;
        formModal.classList.add('hidden');
        formModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    resetEmployeeForm() {
        const form = document.getElementById('employee-form');
        if (!form) return;
        form.reset();
        document.getElementById('employee-id').value = '';
    }

    populateEmployeeForm(employee) {
        document.getElementById('employee-id').value = employee._id || '';
        document.getElementById('employee-firstName').value = employee.firstName || '';
        document.getElementById('employee-lastName').value = employee.lastName || '';
        document.getElementById('employee-middleName').value = employee.middleName || '';
        document.getElementById('employee-nickname').value = employee.nickname || '';
        document.getElementById('employee-email').value = employee.email || '';
        document.getElementById('employee-mobile').value = employee.mobile || '';
        document.getElementById('employee-position').value = employee.position || '';
        document.getElementById('employee-division').value = employee.division || '';
        document.getElementById('employee-employmentType').value = employee.employmentType || 'REGULAR';
        document.getElementById('employee-birthdate').value = employee.birthdateString || '';
        document.getElementById('employee-address').value = employee.address || '';
    }

    async submitEmployeeForm(e) {
        e.preventDefault();
        const id = document.getElementById('employee-id').value;
        const payload = {
            firstName: document.getElementById('employee-firstName').value.trim(),
            lastName: document.getElementById('employee-lastName').value.trim(),
            middleName: document.getElementById('employee-middleName').value.trim(),
            nickname: document.getElementById('employee-nickname').value.trim(),
            email: document.getElementById('employee-email').value.trim(),
            mobile: document.getElementById('employee-mobile').value.trim(),
            position: document.getElementById('employee-position').value.trim(),
            division: document.getElementById('employee-division').value.trim(),
            employmentType: document.getElementById('employee-employmentType').value,
            birthdate: document.getElementById('employee-birthdate').value.trim(),
            address: document.getElementById('employee-address').value.trim()
        };

        try {
            let response;
            if (id) {
                response = await fetch(`${this.apiBaseUrl}/employees/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${this.apiBaseUrl}/employees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save employee');
            }

            await this.fetchEmployeesFromApi();
            this.renderDashboard();
            this.renderCalendar();
            this.renderDivisions();
            this.closeEmployeeForm();
        } catch (error) {
            this.showNotification(error.message || 'Unable to save employee', 'error');
        }
    }

    async deleteEmployeeById(employeeId) {
        if (!employeeId) return;
        try {
            const response = await fetch(`${this.apiBaseUrl}/employees/${employeeId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete employee');
            }
            await this.fetchEmployeesFromApi();
            this.renderDashboard();
            this.renderCalendar();
            this.renderDivisions();
            this.closeEmployeeModal();
            this.showNotification('Employee deleted successfully', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Unable to delete employee', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.filterUpcoming(e.target.value));

        // Add employee
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => this.openEmployeeForm());
        }

        const exportXlsBtn = document.getElementById('export-xls-btn');
        if (exportXlsBtn) {
            exportXlsBtn.addEventListener('click', () => this.exportEmployeesToXLS());
        }

        // Form actions
        const employeeForm = document.getElementById('employee-form');
        if (employeeForm) {
            employeeForm.addEventListener('submit', (e) => this.submitEmployeeForm(e));
        }

        const employeeFormCancel = document.getElementById('employee-form-cancel');
        if (employeeFormCancel) {
            employeeFormCancel.addEventListener('click', () => this.closeEmployeeForm());
        }

        document.getElementById('employee-form-close').addEventListener('click', () => this.closeEmployeeForm());
        document.getElementById('confirm-modal-close').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-cancel-btn').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            if (this.pendingDeleteId) {
                this.deleteEmployeeById(this.pendingDeleteId);
                this.closeConfirmModal();
            }
        });

        // Division filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.filterDivision(e.target.dataset.division);
            }

            if (e.target.classList.contains('edit-employee-btn')) {
                const id = e.target.dataset.employeeId;
                const employee = this.employees.find(emp => emp._id === id);
                if (employee) {
                    this.openEmployeeForm(employee);
                }
            }

            if (e.target.classList.contains('delete-employee-btn')) {
                const id = e.target.dataset.employeeId;
                this.openConfirmModal(id);
            }
        });

        // Employee card modal
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.employee-card');
            if (card) {
                e.stopPropagation();
                const employee = this.employeeDetails.get(card.dataset.employeeId);
                if (employee) {
                    this.showEmployeeModal(employee);
                }
            }
        });

        document.getElementById('employee-modal-close').addEventListener('click', () => this.closeEmployeeModal());
        document.querySelectorAll('.employee-modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                this.closeEmployeeModal();
                this.closeEmployeeForm();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEmployeeModal();
                this.closeEmployeeForm();
            }
        });
    }

    switchPage(pageName) {
        // Update active page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageName).classList.add('active');

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Render page-specific content
        if (pageName === 'calendar') {
            this.renderCalendar();
        } else if (pageName === 'divisions') {
            this.renderDivisions();
        }
    }

    // Dashboard
    renderDashboard() {
        const today = this.employees.filter(e => this.isBirthdayToday(e));
        const thisWeek = this.employees.filter(e => this.isBirthdayThisWeek(e));
        const thisMonth = this.employees.filter(e => this.isBirthdayThisMonth(e));
        const upcoming = this.employees.slice(0, 30);

        this.renderBirthdayList('today-birthdays', today, 'today-count');
        this.renderBirthdayList('week-birthdays', thisWeek, 'week-count');
        this.renderBirthdayList('month-birthdays', thisMonth, 'month-count');
        this.renderUpcomingTable(upcoming);
    }

    renderBirthdayList(elementId, employees, countId) {
        const container = document.getElementById(elementId);
        const countBadge = document.getElementById(countId);
        
        countBadge.textContent = employees.length;

        if (employees.length === 0) {
            container.innerHTML = '<p class="empty-message">No birthdays</p>';
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="birthday-item">
                <div class="birthday-item-name">${emp.firstName} ${emp.lastName}</div>
                <div class="birthday-item-position">${emp.position}</div>
                <div class="birthday-item-date">${emp.displayBirthday}</div>
                <span class="birthday-item-division">${emp.division}</span>
            </div>
        `).join('');
    }

    renderUpcomingTable(employees) {
        const tbody = document.getElementById('upcoming-body');
        const count = document.getElementById('upcoming-count');
        
        count.textContent = employees.length;

        tbody.innerHTML = employees.map(emp => {
            let dayLabel = '';
            if (emp.birthDate) {
                const days = this.daysToBirthday(emp.birthDate);
                dayLabel = `${days} day${days !== 1 ? 's' : ''}`;
                if (days === 0) dayLabel = 'TODAY!';
            } else {
                dayLabel = 'No Date';
            }

            return `
                <tr>
                    <td><span class="days-until-badge">${dayLabel}</span></td>
                    <td><strong>${emp.firstName} ${emp.lastName}</strong></td>
                    <td>${emp.displayBirthday && emp.displayBirthday !== 'No Date' ? emp.displayBirthday : '<span class="no-date-badge">No birthday data</span>'}</td>
                    <td>${emp.division}</td>
                    <td>${emp.position || 'N/A'}</td>
                </tr>
            `;
        }).join('');
    }

    filterUpcoming(searchTerm) {
        const filtered = this.employees.filter(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            const division = emp.division.toLowerCase();
            const term = searchTerm.toLowerCase();
            return fullName.includes(term) || division.includes(term);
        }).slice(0, 30);

        this.renderUpcomingTable(filtered);
    }

    // Calendar
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;

        // Create calendar grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = '';

        // Day headers
        days.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Days from previous month
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${prevMonthDays - i}</div>`;
        }

        // Days of current month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isToday = today.toDateString() === currentDate.toDateString();
            
            // Check if any birthday on this date
            const birthdaysOnDate = this.employees.filter(emp => {
                if (!emp.birthDate) return false;
                return emp.birthDate.getMonth() === month && emp.birthDate.getDate() === day;
            });

            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (birthdaysOnDate.length > 0) classes += ' has-birthday';

            let indicator = birthdaysOnDate.length > 0 ? '🎂' : '';

            html += `<div class="${classes}" data-date="${day}">
                        <div class="calendar-day-number">${day}</div>
                        <div class="calendar-day-indicator">${indicator}</div>
                    </div>`;
        }

        // Days from next month
        const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
        for (let day = 1; day <= totalCells - startingDayOfWeek - daysInMonth; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = html;

        // Add event listeners for calendar days
        grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                const day = parseInt(e.currentTarget.dataset.date);
                this.selectDate(day, year, month);
            });
        });

        // Select today by default
        if (today.getFullYear() === year && today.getMonth() === month) {
            this.selectDate(today.getDate(), year, month);
        }
    }

    selectDate(day, year, month) {
        this.selectedDate = new Date(year, month, day);
        
        const birthdaysOnDate = this.employees.filter(emp => {
            if (!emp.birthDate) return false;
            return emp.birthDate.getMonth() === month && emp.birthDate.getDate() === day;
        });

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('selected-date-title').textContent = 
            `${monthNames[month]} ${day} - ${birthdaysOnDate.length} Birthday(ies)`;

        const container = document.getElementById('selected-date-birthdays');
        if (birthdaysOnDate.length === 0) {
            container.innerHTML = '<p class="empty-message">No birthdays on this date</p>';
        } else {
            container.innerHTML = birthdaysOnDate.map(emp => `
                <div class="birthday-item">
                    <div class="birthday-item-name">${emp.firstName} ${emp.lastName}</div>
                    <div class="birthday-item-position">${emp.position || 'N/A'}</div>
                    <div class="birthday-item-division">${emp.division}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #6b7280;">
                        <strong>Birthday:</strong> ${emp.displayBirthday} ${emp.birthDate ? `(${new Date().getFullYear() - emp.birthDate.getFullYear()} years old)` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    // Divisions
    generateEmployeeCardHTML(emp, uniqueId) {
        this.employeeDetails.set(uniqueId, emp);
        return `
            <div class="employee-card" data-employee-id="${uniqueId}">
                <div class="employee-card-summary">
                    <div class="employee-card-name">${emp.firstName} ${emp.lastName}</div>
                    <div class="employee-card-position">${emp.position || 'N/A'}</div>
                    <div class="employee-card-birthday">${emp.displayBirthday}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-light);">📱 Tap for more info</div>
                </div>
                <div class="employee-card-expanded">
                    <div class="expanded-section">
                        <h4>Full Name</h4>
                        <p>${emp.firstName} ${emp.lastName}</p>
                    </div>
                    ${emp.middleName ? `<div class="expanded-section"><h4>Middle Name</h4><p>${emp.middleName}</p></div>` : ''}
                    <div class="expanded-section">
                        <h4>Nickname</h4>
                        <p>${emp.nickname || 'N/A'}</p>
                    </div>
                    <div class="expanded-section">
                        <h4>Position</h4>
                        <p>${emp.position || 'N/A'}</p>
                    </div>
                    <div class="expanded-section">
                        <h4>Birthday</h4>
                        <p>${emp.displayBirthday || 'No Date'}</p>
                    </div>
                    <div class="expanded-section">
                        <h4>Email</h4>
                        <p>${emp.email ? `<a href="mailto:${emp.email}">${emp.email}</a>` : 'N/A'}</p>
                    </div>
                    <div class="expanded-section">
                        <h4>Mobile</h4>
                        <p>${emp.mobile ? `<a href="tel:${emp.mobile}">${emp.mobile}</a>` : 'N/A'}</p>
                    </div>
                    ${emp.address ? `<div class="expanded-section"><h4>Address</h4><p>${emp.address}</p></div>` : ''}
                    <div class="expanded-section">
                        <h4>Employment Type</h4>
                        <p><span class="employment-type-badge">${emp.employmentType}</span></p>
                    </div>
                    <div class="expanded-section">
                        <h4>Division</h4>
                        <p>${emp.division}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDivisions() {
        this.employeeDetails.clear();

        // Remove null/undefined divisions
        const validDivisions = Array.from(this.divisions.entries()).filter(([key]) => {
            return key && key !== 'null' && key !== 'undefined' && key !== 'Unassigned';
        });

        // Create filter buttons - only for valid divisions
        const filterContainer = document.getElementById('division-filters');
        filterContainer.innerHTML = `
            <button class="filter-btn active" data-division="all">All Divisions</button>
            ${validDivisions.map(([division, emps]) => {
                const count = emps.length;
                return `<button class="filter-btn" data-division="${division}">${division.substring(0, 20)}${division.length > 20 ? '...' : ''} <span style="font-size: 0.85rem;">(${count})</span></button>`;
            }).join('')}
        `;

        // Render divisions - valid first, then unassigned
        const content = document.getElementById('divisions-content');
        let html = '';

        // Render valid divisions
        validDivisions.forEach(([division, employees]) => {
            // Group by employment type with proper order
            const typeOrder = ['REGULAR', 'JOB ORDER', 'GIP'];
            const grouped = {};
            
            typeOrder.forEach(type => {
                grouped[type] = [];
            });
            
            employees.forEach(emp => {
                if (!grouped[emp.employmentType]) {
                    grouped[emp.employmentType] = [];
                }
                grouped[emp.employmentType].push(emp);
            });

            html += `
                <div class="division-card">
                    <h2>${division}</h2>
                    <div style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.95rem;">
                        Total Employees: <strong>${employees.length}</strong>
                    </div>
                    ${Object.entries(grouped).map(([type, emps]) => {
                        if (emps.length === 0) return '';
                        
                        return `
                            <div>
                                <div class="employee-type-header">
                                    ${type} (${emps.length} employee${emps.length !== 1 ? 's' : ''})
                                </div>
                                <div class="employee-list">
                                    ${emps.map((emp, idx) => this.generateEmployeeCardHTML(emp, `${division}-${type}-${idx}`)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        });
        if (this.divisions.has('Unassigned') && this.divisions.get('Unassigned').length > 0) {
            const employees = this.divisions.get('Unassigned');
            const typeOrder = ['REGULAR', 'JOB ORDER', 'GIP'];
            const grouped = {};
            
            typeOrder.forEach(type => {
                grouped[type] = [];
            });
            
            employees.forEach(emp => {
                if (!grouped[emp.employmentType]) {
                    grouped[emp.employmentType] = [];
                }
                grouped[emp.employmentType].push(emp);
            });

            html += `
                <div class="division-card" style="border-top-color: var(--warning-color);">
                    <h2>⚠️ Unassigned Employees</h2>
                    <div style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.95rem;">
                        Total Employees: <strong>${employees.length}</strong>
                    </div>
                    ${Object.entries(grouped).map(([type, emps]) => {
                        if (emps.length === 0) return '';
                        
                        return `
                            <div>
                                <div class="employee-type-header">
                                    ${type} (${emps.length} employee${emps.length !== 1 ? 's' : ''})
                                </div>
                                <div class="employee-list">
                                    ${emps.map((emp, idx) => this.generateEmployeeCardHTML(emp, `Unassigned-${type}-${idx}`)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        content.innerHTML = html;

        // Add filter button event listeners
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterDivision(btn.dataset.division));
        });
    }

    filterDivision(division) {
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-division="${division}"]`).classList.add('active');

        // Filter division cards
        const cards = document.querySelectorAll('.division-card');
        if (division === 'all') {
            cards.forEach(card => {
                card.style.display = 'block';
                card.classList.add('active');
            });
        } else {
            cards.forEach(card => {
                const heading = card.querySelector('h2').textContent;
                // Check if heading contains the division name (for normal divisions or Unassigned)
                if (heading.includes(division) || (division === 'Unassigned' && heading.includes('Unassigned'))) {
                    card.style.display = 'block';
                    card.classList.add('active');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('active');
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayTracker();
});
