import { Router } from 'express';
import { check, validationResult } from 'express-validator';

const router = Router();

// In-memory contact list
export const initialContacts = () => ([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: 3, name: 'Emily Johnson', email: 'emily.johnson@example.com' },
    { id: 4, name: 'Aarav Patel', email: 'aarav.patel@example.com' },
    { id: 5, name: 'Liu Wei', email: 'liu.wei@example.com' },
    { id: 6, name: 'Fatima Zahra', email: 'fatima.zahra@example.com' },
    { id: 7, name: 'Carlos Hernández', email: 'carlos.hernandez@example.com' },
    { id: 8, name: 'Olivia Kim', email: 'olivia.kim@example.com' },
    { id: 9, name: 'Kwame Nkrumah', email: 'kwame.nkrumah@example.com' },
    { id: 10, name: 'Chen Yu', email: 'chen.yu@example.com' },
]);

let contacts = initialContacts();

export const resetContacts = () => {
  contacts = initialContacts();
};

const sendFragments = (res, fragments) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    fragments.forEach(f => {
        // V1.0.0-RC.7 Protocol
        res.write(`event: datastar-patch-elements\n`);
        // CRITICAL: Remove ALL whitespace characters that could break SSE parsing
        const cleanHtml = f.replace(/[\r\n\t]+/g, ' ').trim();
        res.write(`data: elements ${cleanHtml}\n\n`);
    });
    res.end();
};

// GET /contacts (All contacts)
router.get('/contacts', (req, res) => {
    res.render('index', { action: '', contacts, contact: {} });
});

// GET /contacts/new (New Contact)
router.get('/contacts/new', (req, res) => {
    // Ensure we always pass contact: {} so form.pug can find it
    const data = {
        contact: {id: null, name: '', email: ''}
    };

// Why this matters for your code:
// This header serves the same purpose as hx-request in HTMX.
// It allows your Express server to differentiate between two types of requests to the same URL:
// 1. Header is MISSING: A user typed the URL into the browser or refreshed the page.
//    Your server should render the full page (index.pug).
// 2. Header is true: Datastar is asking for a partial update.
//    Your server should send an SSE stream (text/event-stream) containing only the specific HTML fragment (e.g., just the form.pug content).
// 
// A. Action Attributes
//    Whenever you use the @get, @post, @put, @patch,
//        or @delete helper functions within a data-on attribute:
// B. Element Plugins (Attribute-based requests)
//    If you use plugins that automatically sync or fetch data:
//        data-attr with a URL: If an attribute is bound to a remote source.
//        data-on:load: If you trigger a fetch as soon as an element enters the DOM.
// C. Script-based Actions
//    If you call Datastar actions manually via JavaScript (though less common in a Pug-heavy setup):
//        Example: Datastar.get('/some-url')
    if (req.headers['datastar-request']) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.render('form', data, (err, html) => {
            if (err) {
                console.error("Rendering Error:", err);
                return res.end();
            }

            // 2. USE 'elements' NOT 'fragment' for RC.7
            // 3. Ensure HTML is on one line for SSE data safety
            const sseData = html.replace(/\n/g, '');
            res.write(`event: datastar-patch-elements\n`);
            res.write(`data: elements <main id="content">${sseData}</main>\n\n`);
            res.end();
        });
    } else {
        res.render('index', { action: 'new', contacts, contact: data.contact });
    }
});

// GET /contacts/:id (Single Fragment Update)
router.get('/contacts/:id', (req, res) => {
    const contact = contacts.find(c => c.id === Number(req.params.id));

    if (req.headers['datastar-request']) {
        res.render('contact', { contact }, (err, html) => {
            sendFragments(res, [`<main id="content">${html}</main>`]);
        });
    } else {
        res.render('index', { action: 'show', contacts, contact });
    }
});

// GET /contacts/:id/edit
// Edit contact form in content area
router.get('/contacts/:id/edit', (req, res) => {
    const { id } = req.params;
    const contact = contacts.find((c) => c.id === Number(id));

    if (!contact) {
        return res.status(404).send("Contact not found");
    }

    if (req.headers['datastar-request']) {
        // Set SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Render form partial
        res.render('form', { contact }, (err, html) => {
            if (err) return res.status(500).end();

            // v1.0.0-RC.7 protocol: event: datastar-patch-elements | data: elements
            // We strip newlines to ensure SSE data safety
            const cleanHtml = html.replace(/\n/g, '');
            res.write(`event: datastar-patch-elements\n`);
            res.write(`data: elements <main id="content">${cleanHtml}</main>\n\n`);
            res.end();
        });
    } else {
        // Standard initial page load
        res.render('index', { action: 'edit', contacts, contact });
    }
});

// POST /contacts (New Contact)
router.post('/contacts', (req, res) => {
    // Datastar sends signals as a JSON body
    const { name, email } = req.body; 
    const newContact = { id: contacts.length + 1, name, email };
    contacts.push(newContact);

    res.setHeader('Content-Type', 'text/event-stream');    
    res.render('sidebar', { contacts }, (err, sidebarHtml) => {
        const sidebarFrag = `<section id="sidebar">${sidebarHtml.replace(/\n/g, '')}</section>`;
        const flashFrag = `<main id="content"><p class="flash">Contact added.</p></main>`;

        res.write(`event: datastar-patch-elements\ndata: elements ${sidebarFrag}\n\n`);
        res.write(`event: datastar-patch-elements\ndata: elements ${flashFrag}\n\n`);
        res.end();
    });
});

router.put('/update/:id',
    [
        check('name').isLength({ min: 1 }).withMessage('Name is required'),
        check('email').isEmail().withMessage('Valid email is required')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const id = Number(req.params.id);
        const { name, email } = req.body; // Datastar sends data in req.body
        const index = contacts.findIndex(c => c.id === id);

        if (index !== -1) {
            contacts[index] = { id, name, email };
        }

        // Set Datastar SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');

        // Render both the updated sidebar and the contact details
        res.render('sidebar', { contacts }, (err, sidebarHtml) => {
            res.render('contact', { contact: contacts[index] }, (err, contactHtml) => {
                // Fragment 1: Update the sidebar list
                res.write(`event: datastar-patch-elements\ndata: elements <section id="sidebar">${sidebarHtml.replace(/\n/g, '')}</section>\n\n`);
                
                // Fragment 2: Update the content area with a success message and details
                // const contentHtml = `<main id="content"><p class="flash">Contact updated.</p>${contactHtml}</main>`;
                // res.write(`event: datastar-patch-elements\ndata: elements ${contentHtml.replace(/\n/g, '')}\n\n`);
                const contentHtml = `<main id="content"><p class="flash">Contact updated.</p>${contactHtml}</main>`;
                res.write(`event: datastar-patch-elements\ndata: elements ${contentHtml}\n\n`);
                
                res.end();
            });
        });
    }
);

// DELETE /delete/:id
router.delete('/delete/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) contacts.splice(index, 1);

    res.render('sidebar', { contacts }, (err, sidebarHtml) => {
        sendFragments(res, [
            `<section id="sidebar">${sidebarHtml}</section>`,
            `<main id="content"><p class="flash">Contact was successfully deleted!</p></main>`
        ]);
    });
});

export default router;
