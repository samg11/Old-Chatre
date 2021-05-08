const {app} = require('../dist/app');

const supertest = require('supertest')
const request = supertest(app)

it('Test API', async done => {
  const response = await request.get('/test');
  expect(response.status).toBe(200);
  done();
})