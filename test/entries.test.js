const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const Entry = require('../models/Entry');

let mongo;

before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Entry.init();
});

after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

beforeEach(async () => {
    await Entry.deleteMany({});
});

const tomorrowPlusTwo = () =>
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

test('GET /health reports ok', async () => {
    const res = await request(app).get('/health').expect(200);
    assert.equal(res.body.ok, true);
});

test('POST creates an entry and trims the response', async () => {
    const res = await request(app)
        .post('/entries')
        .send({ date: '2026-01-05', response: '  went for a walk  ' })
        .expect(201);
    assert.equal(res.body.response, 'went for a walk');
});

test('POST rejects a second entry for the same day', async () => {
    await request(app).post('/entries').send({ date: '2026-01-05', response: 'a' }).expect(201);
    await request(app).post('/entries').send({ date: '2026-01-05', response: 'b' }).expect(409);
});

test('POST validates date and response', async () => {
    await request(app).post('/entries').send({ date: '2026-02-30', response: 'x' }).expect(400);
    await request(app).post('/entries').send({ date: 'yesterday', response: 'x' }).expect(400);
    await request(app).post('/entries').send({ date: tomorrowPlusTwo(), response: 'x' }).expect(400);
    await request(app).post('/entries').send({ date: '2026-01-05', response: '   ' }).expect(400);
    await request(app).post('/entries').send({ date: '2026-01-05' }).expect(400);
    await request(app)
        .post('/entries')
        .send({ date: '2026-01-05', response: 'x'.repeat(2001) })
        .expect(400);
});

test('GET lists entries newest first', async () => {
    await Entry.create([
        { date: '2026-01-01', response: 'a' },
        { date: '2026-01-03', response: 'c' },
        { date: '2026-01-02', response: 'b' },
    ]);
    const res = await request(app).get('/entries').expect(200);
    assert.deepEqual(res.body.map((e) => e.date), ['2026-01-03', '2026-01-02', '2026-01-01']);
});

test('GET /:date returns the entry or 404', async () => {
    await Entry.create({ date: '2026-01-01', response: 'a' });
    const res = await request(app).get('/entries/2026-01-01').expect(200);
    assert.equal(res.body.response, 'a');
    await request(app).get('/entries/2026-01-02').expect(404);
    await request(app).get('/entries/not-a-date').expect(400);
});

test('PUT creates then updates an entry', async () => {
    await request(app).put('/entries/2026-01-01').send({ response: 'first' }).expect(200);
    const res = await request(app).put('/entries/2026-01-01').send({ response: 'edited' }).expect(200);
    assert.equal(res.body.response, 'edited');
    assert.equal(await Entry.countDocuments(), 1);
    await request(app).put('/entries/2026-01-01').send({ response: '' }).expect(400);
});

test('DELETE removes an entry and is idempotent', async () => {
    await Entry.create({ date: '2026-01-01', response: 'a' });
    await request(app).delete('/entries/2026-01-01').expect(204);
    await request(app).delete('/entries/2026-01-01').expect(204);
    assert.equal(await Entry.countDocuments(), 0);
});

test('Invalid JSON returns 400', async () => {
    await request(app)
        .post('/entries')
        .set('Content-Type', 'application/json')
        .send('{bad json')
        .expect(400);
});
