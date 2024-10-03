import Bool "mo:base/Bool";
import List "mo:base/List";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Text "mo:base/Text";

actor ShoppingList {
  // Define the structure of a shopping list item
  type Item = {
    id: Nat;
    text: Text;
    completed: Bool;
  };

  // Store the shopping list items
  stable var items : [Item] = [];
  stable var nextId : Nat = 0;

  // Add a new item to the shopping list
  public func addItem(text: Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newItem : Item = {
      id = id;
      text = text;
      completed = false;
    };
    items := Array.append(items, [newItem]);
    id
  };

  // Get all items in the shopping list
  public query func getItems() : async [Item] {
    items
  };

  // Toggle the completed status of an item
  public func toggleItem(id: Nat) : async Bool {
    let index = Array.indexOf<Item>({ id = id; text = ""; completed = false }, items, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let updatedItem = {
          id = items[i].id;
          text = items[i].text;
          completed = not items[i].completed;
        };
        items := Array.tabulate<Item>(items.size(), func (j) {
          if (j == i) { updatedItem } else { items[j] }
        });
        true
      };
    };
  };

  // Delete an item from the shopping list
  public func deleteItem(id: Nat) : async Bool {
    let newItems = Array.filter<Item>(items, func(item) { item.id != id });
    if (newItems.size() < items.size()) {
      items := newItems;
      true
    } else {
      false
    };
  };
}
