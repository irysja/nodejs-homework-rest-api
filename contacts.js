const express = require('express');
const router = express.Router();
const fs = require('fs/promises'); // Для работы с файлами (async/await версия)
const { v4: uuidv4 } = require('uuid'); // Для генерации уникальных идентификаторов

// Функция для чтения данных из файла contacts.json
async function readContactsFile() {
  try {
    const data = await fs.readFile('models/contacts.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Функция для записи данных в файл contacts.json
async function writeContactsFile(contacts) {
  await fs.writeFile('models/contacts.json', JSON.stringify(contacts, null, 2), 'utf8');
}

// GET /api/contacts
router.get('/', async (req, res) => {
  const contacts = await readContactsFile();
 // console.log('Sending contacts:', contacts); 
  res.json(contacts);
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  const contacts = await readContactsFile();
  const contactId = req.params.id;
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  res.json(contact);
});

// POST /api/contacts
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const contacts = await readContactsFile();
  const newContact = { id: uuidv4(), name, email, phone };
  contacts.push(newContact);

  await writeContactsFile(contacts);

  res.status(201).json(newContact);
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  const contactId = req.params.id;
  const contacts = await readContactsFile();
  const index = contacts.findIndex((c) => c.id === contactId);

  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  const deletedContact = contacts.splice(index, 1);
  await writeContactsFile(contacts);

  res.json({ message: 'Contact deleted' });
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res) => {
  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  const contacts = await readContactsFile();
  const index = contacts.findIndex((c) => c.id === contactId);

  if (index === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  contacts[index] = { ...contacts[index], name, email, phone };
  await writeContactsFile(contacts);

  res.json(contacts[index]);
});

module.exports = router;

