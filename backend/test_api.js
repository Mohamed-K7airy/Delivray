async function test() {
  try {
    console.log("Testing POST /auth/register on localhost:5000");
    const res = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        phone: '1234567890',
        password: 'password123',
        role: 'customer'
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
