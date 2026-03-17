const axios = require('axios');

async function testBishop() {
    try {
        const API_URL = 'http://localhost:5000/api'; // Assuming local dev server is running on port 5000, or we can use render

        // Login as Bishop
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'bishop@test.com', // Replace with a known or test bishop email if needed
            password: 'test' // the test stub
        }).catch(e => {
            console.log("Login failed");
            return null;
        });

        if (!loginRes) {
            console.log("Cannot test without login. Make sure local server is running and we have a test user.");
            return;
        }

        const token = loginRes.data.token;
        console.log("Logged in successfully. Token length:", token.length);

        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
            '/dashboard',
            '/reports/member-growth?period=3months',
            '/dashboard/financials',
            '/bacenta/meetings?limit=5',
            '/dashboard/rankings'
        ];

        for (const ep of endpoints) {
            console.log(`\nTesting ${ep}...`);
            try {
                const res = await axios.get(`${API_URL}${ep}`, { headers });
                console.log(`SUCCESS [200]. Response keys:`, Object.keys(res.data));
            } catch (err) {
                if (err.response) {
                    console.error(`FAILED [${err.response.status}]:`, err.response.data);
                } else {
                    console.error(`FAILED:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error("Test script failed", err.message);
    }
}

testBishop();
