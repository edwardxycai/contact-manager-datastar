import request from 'supertest';
import app from '../app.js';
import fs from 'fs';
import { resetContacts } from '../routes/index.js';

beforeEach(() => {
  resetContacts();
});

// -- Case Expected
//      No headers	200 + full HTML
//      Renders sidebar	contact names present
//      Renders default content	“Select a contact”
describe('GET /contacts', () => {
    // GET /contacts
    it('renders index page with contacts', async () => {
        const res = await request(app).get('/contacts');

        expect(res.status).toBe(200);
        expect(res.text).toContain('Contact Manager');
        expect(res.text).toContain('John Doe');
        expect(res.text).toContain('Select a contact');
    });

    // GET /contacts/:id
    it('renders full page contact view', async () => {
        const res = await request(app).get('/contacts/1');

        expect(res.status).toBe(200);
        expect(res.text).toContain('John Doe');
        expect(res.text).toContain('john.doe@example.com');
    });

    // Datastar SSE request
    it('returns SSE fragment for datastar request', async () => {
        const res = await request(app)
            .get('/contacts/1')
            .set('datastar-request', 'true');

        expect(res.headers['content-type']).toContain('text/event-stream');
        expect(res.text).toContain('event: datastar-patch-elements');
        expect(res.text).toContain('<main id="content">');
    });

    // GET /contacts/new  
    it('returns SSE form fragment for new contact', async () => {
        const res = await request(app)
            .get('/contacts/new')
            .set('datastar-request', 'true');

        expect(res.status).toBe(200);
        expect(res.text).toContain('New Contact');
        expect(res.text).toContain('data: elements');
    });

    // POST /contacts
    it('creates contact and returns sidebar + flash SSE fragments', async () => {
        const res = await request(app)
            .post('/contacts')
            .send({ name: 'Test User', email: 'test@example.com' });

        expect(res.headers['content-type']).toContain('text/event-stream');
        expect(res.text).toContain('Contact added.');
        expect(res.text).toContain('Test User');
    });

    // PUT /update/:id
    it('updates contact and sends SSE fragments', async () => {
        const res = await request(app)
            .put('/update/1')
            .send({ name: 'Updated Name', email: 'updated@example.com' });

        expect(res.text).toContain('Contact updated.');
        expect(res.text).toContain('Updated Name');
    });

    // Validation failure
    it('rejects invalid email', async () => {
        const res = await request(app)
            .put('/update/1')
            .send({ name: 'X', email: 'invalid' });

        expect(res.status).toBe(422);
    });

    // DELETE /delete/:id
    it('deletes contact and updates sidebar', async () => {
        const res = await request(app)
            .delete('/delete/1');

        expect(res.text).toContain('Contact was successfully deleted!');
    });

    // SSE Protocol Compliance Tests
    it('SSE payload has no newlines inside data block', async () => {
        const res = await request(app)
            .get('/contacts/2')
            .set('datastar-request', 'true');

        const dataLines = res.text
            .split('\n')
            .filter(l => l.startsWith('data:'));

        dataLines.forEach(line => {
            expect(line).not.toMatch(/\n|\r|\t/);
        });
    });

    // View (Pug) Rendering Tests
    // -- contact.pug
    it('renders contact view correctly', async () => {
        const res = await request(app).get('/contacts/3');

        expect(res.text).toContain('<strong>Name:</strong>');
        expect(res.text).toContain('Emily Johnson');
    });    

    // -- form.pug (edit mode)
    it('renders edit form when editing', async () => {
        const res = await request(app).get('/contacts/1/edit');

        expect(res.text).toContain('Edit Contact');
        expect(res.text).toContain('data-bind:name');
    });
});

// CSS Test Cases (Contract & Regression)
// -- Contract tests (string-based)
describe('styles.css', () => {
    const css = fs.readFileSync('public/styles.css', 'utf8');

    it('defines primary color', () => {
        expect(css).toContain('--color-primary');
    });

    it('has flash styling', () => {
        expect(css).toContain('.flash');
        expect(css).toContain('background-color: var(--color-flash)');
    });

    it('uses CSS grid layout', () => {
        expect(css).toContain('grid-template');
    });

    // App Bootstrap Tests  
    it('app responds on root routes', async () => {
        const res = await request(app).get('/contacts');
        expect(res.status).toBe(200);
    });

});




