const fetch = require('node-fetch'); // wait I'll just use fetch

async function test() {
  const res3 = await fetch('http://localhost:5000/api/onboarding/profile', {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-mock-user-id': 'fake-uid-456' 
    },
    body: JSON.stringify({
      step_number: 3,
      data: {
        goal: 'Lose fat',
        targetWeight: '',
        targetDate: '',
        event: '',
        urgency: 'Moderate'
      }
    })
  });
  console.log('Step 3 Patch:', res3.status, await res3.text());
}

test();
