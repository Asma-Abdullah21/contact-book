const STORAGE_KEY = 'contact-book:contacts';

const form = document.getElementById('contact-form');
const idField = document.getElementById('contact-id');
const nameField = document.getElementById('name');
const phoneField = document.getElementById('phone');
const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const listEl = document.getElementById('contact-list');
const emptyState = document.getElementById('empty-state');
const countEl = document.getElementById('contact-count');

function loadContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved contacts:', err);
    return [];
  }
}

function saveContacts(contacts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Could not save contacts:', err);
  }
}

let contacts = loadContacts();

function render() {
  listEl.innerHTML = '';
  emptyState.hidden = contacts.length !== 0;
  countEl.textContent = contacts.length;

  contacts.forEach((contact) => {
    const li = document.createElement('li');
    li.className = 'contact-card';
    li.dataset.id = contact.id;

    li.innerHTML = `
      <div class="contact-card__info">
        <p class="contact-card__name"></p>
        <p class="contact-card__phone"></p>
      </div>
      <div class="contact-card__actions">
        <button type="button" class="icon-btn edit-btn" aria-label="Edit ${escapeAttr(contact.name)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" class="icon-btn icon-btn--danger delete-btn" aria-label="Delete ${escapeAttr(contact.name)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    `;

    li.querySelector('.contact-card__name').textContent = contact.name;
    li.querySelector('.contact-card__phone').textContent = contact.phone;

    li.querySelector('.edit-btn').addEventListener('click', () => startEdit(contact.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteContact(contact.id));

    listEl.appendChild(li);
  });
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function resetForm() {
  form.reset();
  idField.value = '';
  submitBtn.textContent = 'Add contact';
  cancelBtn.hidden = true;
  nameError.textContent = '';
  phoneError.textContent = '';
}

function startEdit(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  idField.value = contact.id;
  nameField.value = contact.name;
  phoneField.value = contact.phone;
  submitBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  nameField.focus();
}

function deleteContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  if (!confirm(`Delete ${contact.name}?`)) return;

  contacts = contacts.filter((c) => c.id !== id);
  saveContacts(contacts);
  render();

  if (idField.value === id) resetForm();
}

function validate() {
  let valid = true;
  nameError.textContent = '';
  phoneError.textContent = '';

  const name = nameField.value.trim();
  const phone = phoneField.value.trim();

  if (!name) {
    nameError.textContent = 'Enter a name.';
    valid = false;
  }

  if (!phone) {
    phoneError.textContent = 'Enter a phone number.';
    valid = false;
  } else if (!/^[0-9+\-\s()]{5,}$/.test(phone)) {
    phoneError.textContent = 'Use only digits, spaces, +, -, and ().';
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  const name = nameField.value.trim();
  const phone = phoneField.value.trim();
  const editingId = idField.value;

  if (editingId) {
    contacts = contacts.map((c) =>
      c.id === editingId ? { ...c, name, phone } : c
    );
  } else {
    contacts.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      name,
      phone,
    });
  }

  saveContacts(contacts);
  render();
  resetForm();
});

cancelBtn.addEventListener('click', resetForm);

render();
