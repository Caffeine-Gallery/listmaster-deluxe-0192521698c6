import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/backend/backend.did.js';

const agent = new HttpAgent();
const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId: process.env.BACKEND_CANISTER_ID,
});

document.addEventListener('DOMContentLoaded', async () => {
  const shoppingList = document.getElementById('shopping-list');
  const addItemForm = document.getElementById('add-item-form');
  const newItemInput = document.getElementById('new-item');

  // Function to render the shopping list
  async function renderShoppingList() {
    const items = await backend.get_items();
    shoppingList.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="${item.completed ? 'completed' : ''}">${item.text}</span>
        <div>
          <button class="toggle-btn" data-id="${item.id}">
            <i class="fas ${item.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
          </button>
          <button class="delete-btn" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      shoppingList.appendChild(li);
    });
  }

  // Add new item
  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = newItemInput.value.trim();
    if (text) {
      await backend.add_item(text);
      newItemInput.value = '';
      await renderShoppingList();
    }
  });

  // Toggle item completion
  shoppingList.addEventListener('click', async (e) => {
    if (e.target.closest('.toggle-btn')) {
      const id = BigInt(e.target.closest('.toggle-btn').dataset.id);
      await backend.toggle_item(id);
      await renderShoppingList();
    }
  });

  // Delete item
  shoppingList.addEventListener('click', async (e) => {
    if (e.target.closest('.delete-btn')) {
      const id = BigInt(e.target.closest('.delete-btn').dataset.id);
      await backend.delete_item(id);
      await renderShoppingList();
    }
  });

  // Initial render
  await renderShoppingList();
});
