import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';
const ADMIN_PHONE = '1234567890'; // Replace with actual admin phone
let authToken = '';

async function testAdminModule() {
    console.log('🔍 Testing Admin Module...\n');
    
    // Step 1: Login as Admin
    try {
        await axios.post(`${API_BASE_URL}/auth/send-otp`, { phoneNumber: ADMIN_PHONE });
        const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
            phoneNumber: ADMIN_PHONE,
            otp: '123456'
        });
        authToken = verifyResponse.data.token;
        console.log('✅ Admin Authenticated\n');
    } catch (error: any) {
        console.log('❌ Admin Auth failed:', error.response?.data || error.message);
        return;
    }
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Test: Generate Tags
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/tags/generate`, {
            count: 5,
            domain: 'car'
        }, { headers });
        console.log('✅ Generate Tags:', response.data.message);
    } catch (error: any) {
        console.log('❌ Generate Tags failed:', error.response?.data || error.message);
    }
}

testAdminModule();
