import axios from 'axios';

const API_BASE_URL = 'https://carcard.onrender.com/api';
const TEST_PHONE = '9876543210';

async function testAuthModule() {
    // console.log('🔍 Testing Auth Module...\n');

    // Test 1: Send OTP
    try {
        const otpResponse = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
            phoneNumber: TEST_PHONE
        });
        // console.log('✅ Send OTP:', otpResponse.data.message);
    } catch (error: any) {
        console.error('❌ Send OTP failed:', error.response?.data || error.message);
        return;
    }

    // Test 2: Verify OTP
    try {
        const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
            phoneNumber: TEST_PHONE,
            otp: '123456'
        });
        // console.log('✅ Verify OTP:', verifyResponse.data.message);
        // console.log('Token:', verifyResponse.data.token?.substring(0, 20) + '...');
    } catch (error: any) {
        console.error('❌ Verify OTP failed:', error.response?.data || error.message);
    }
}

testAuthModule();
