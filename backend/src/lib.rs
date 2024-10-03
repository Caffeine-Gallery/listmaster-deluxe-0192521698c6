use candid::{CandidType, Deserialize};
use ic_cdk::export::{
    candid,
    Principal,
};
use ic_cdk_macros::*;
use std::cell::RefCell;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Item {
    id: u64,
    text: String,
    completed: bool,
}

thread_local! {
    static ITEMS: RefCell<Vec<Item>> = RefCell::new(Vec::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(0);
}

#[update]
fn add_item(text: String) -> u64 {
    let id = NEXT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() += 1;
        current_id
    });

    let new_item = Item {
        id,
        text,
        completed: false,
    };

    ITEMS.with(|items| items.borrow_mut().push(new_item));
    id
}

#[query]
fn get_items() -> Vec<Item> {
    ITEMS.with(|items| items.borrow().clone())
}

#[update]
fn toggle_item(id: u64) -> bool {
    ITEMS.with(|items| {
        let mut items = items.borrow_mut();
        if let Some(item) = items.iter_mut().find(|item| item.id == id) {
            item.completed = !item.completed;
            true
        } else {
            false
        }
    })
}

#[update]
fn delete_item(id: u64) -> bool {
    ITEMS.with(|items| {
        let mut items = items.borrow_mut();
        let initial_len = items.len();
        items.retain(|item| item.id != id);
        items.len() < initial_len
    })
}

// Required for Candid interface generation
candid::export_service!();
