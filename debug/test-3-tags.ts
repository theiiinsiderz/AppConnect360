import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';
const TEST_PHONE = '9876543210';
let authToken = '';

async function testTagModule() {
    // console.log('🔍 Testing Tag Module...\n');

    // Step 1: Login
    try {
        await axios.post(`${API_BASE_URL}/auth/send-otp`, { phoneNumber: TEST_PHONE });
        const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
            phoneNumber: TEST_PHONE,
            otp: '123456'
        });
        authToken = verifyResponse.data.token;
        // console.log('✅ Authenticated\n');
    } catch (error: any) {
        console.error('❌ Auth failed:', error.response?.data || error.message);
        return;
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // Test 1: Get Tags
    try {
        const response = await axios.get(`${API_BASE_URL}/tags`, { headers });
        // console.log('✅ Get Tags:', response.data.length, 'tags found');
    } catch (error: any) {
        console.error('❌ Get Tags failed:', error.response?.data || error.message);
    }

    // Test 2: Activate Tag
    try {
        const response = await axios.post(`${API_BASE_URL}/tags/activate`, {
            tagCode: 'TEST-001',
            domain: 'car',
            vehicleNumber: 'TEST123'
        }, { headers });
        // console.log('✅ Activate Tag:', response.data.message);
    } catch (error: any) {
        console.error('❌ Activate Tag failed:', error.response?.data?.message || error.message);
    }
}

testTagModule();
