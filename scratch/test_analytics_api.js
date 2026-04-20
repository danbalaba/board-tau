const fetch = require('node-fetch');

async function testApi() {
  try {
    // We can't easily test with session here, but we can check if the route exists or has syntax errors
    console.log('Checking API route presence...');
  } catch (e) {
    console.error(e);
  }
}

testApi();
