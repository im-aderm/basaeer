import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3001/auth/login', {
            email: 'superadmin@basaer.com',
            password: 'admin123'
        });
        console.log('Login successful!');
        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
