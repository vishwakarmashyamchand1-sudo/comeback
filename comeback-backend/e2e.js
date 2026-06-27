const fetch = require('node-fetch');

async function run() {
  const email = `test-${Date.now()}@example.com`;
  
  // 1. Register
  const res1 = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, firebaseUid: 'e2e-' + Date.now() })
  });
  const authData = await res1.json();
  const mockId = authData.data.firebaseUid;

  // 2. Step 1
  const resStep1 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({
      step_number: 1,
      data: { name: 'E2E', gender: 'Male', dob: { d: '10', m: '5', y: '1995' }, heightCm: '180', weightKg: '80' }
    })
  });
  console.log('Step 1:', resStep1.status);

  // 3. Step 2
  const resStep2 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({
      step_number: 2,
      data: { level: 'Returning', lastActive: '1 month', daysPerWeek: 4, time: 'Morning', location: 'Home', strongest: 'Chest', weakest: 'Legs' }
    })
  });
  console.log('Step 2:', resStep2.status);

  // 4. Step 3
  const resStep3 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({
      step_number: 3,
      data: { goal: 'Lose fat', targetWeight: '', targetDate: '', event: '', urgency: 'Moderate' }
    })
  });
  console.log('Step 3:', resStep3.status);

  // 5. Step 4
  const resStep4 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({
      step_number: 4,
      data: { type: 'Vegetarian', restrictions: [], supplements: [] }
    })
  });
  console.log('Step 4:', resStep4.status);

  // 6. Step 5
  const resStep5 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({
      step_number: 5,
      data: { injuries: [], conditions: [], avoid: '' }
    })
  });
  console.log('Step 5:', resStep5.status);

  // 7. Complete
  const resComplete = await fetch('http://localhost:5000/api/onboarding/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-mock-user-id': mockId },
    body: JSON.stringify({})
  });
  console.log('Complete:', resComplete.status, await resComplete.text());
}

run();
