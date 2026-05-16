
import axios from 'axios';

async function reproduce() {
  const email = 'super.admin@basaeer.com';
  const password = 'Password123!';
  const baseUrl = 'http://localhost:3001/api/v1';

  try {
    console.log('Attempting login...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password }, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const token = loginRes.data.access_token;
    console.log('Login successful.');

    console.log('Fetching dashboard data...');
    const dashboardRes = await axios.get(`${baseUrl}/reporting/dashboard`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('Dashboard Data Structure:');
    console.log(JSON.stringify(dashboardRes.data, null, 2));

    if (dashboardRes.data.academic && typeof dashboardRes.data.academic.totalStudents !== 'undefined') {
      console.log('SUCCESS: academic.totalStudents found:', dashboardRes.data.academic.totalStudents);
    } else {
      console.log('ERROR: academic.totalStudents NOT found or academic is undefined');
    }

  } catch (error: any) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

reproduce();
