// backend/__tests__/app.test.js

const request = require('supertest');
const express = require('express');

// We will create a minimal app instance for testing,
// so we don't need to import the whole index.js and connect to MongoDB.
const app = express();

// Let's create a simple "health check" endpoint for our test.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Describe what we are testing
describe('GET /api/health', () => {

  // The actual test
  test('should respond with a 200 status and a success message', async () => {
    // Use supertest to make a request to the test app
    const response = await request(app).get('/api/health');

    // Assert that the HTTP status code is 200 (OK)
    expect(response.statusCode).toBe(200);

    // Assert that the response body is what we expect
    expect(response.body).toEqual({ status: 'ok' });
  });

});