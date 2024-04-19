import { test as base } from "@playwright/test";
import { ToDoApp } from "../lib/models/todo";

// Extend basic test by providing a "toDoApp" fixture.
const test = base.extend<{ todoApp: ToDoApp }>({
  todoApp: async ({ page }, use) => {
    const todo = new ToDoApp(page);
    await use(todo);
  },
});

test.describe("New Todo", () => {
  test("should allow me to add todo items", async ({ todoApp }) => {
    await todoApp.visit();
    await todoApp.createNewToDo();
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.createNewToDo();
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });

  test("should clear text input field when an item is added", async ({
    todoApp,
  }) => {
    await todoApp.visit();
    await todoApp.createNewToDo();
    await todoApp.verifyInputFieldIsEmpty();
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });

  test("should append new items to the bottom of the list", async ({
    todoApp,
  }) => {
    await todoApp.visit();
    await todoApp.createNewToDos(3);
    await todoApp.verifyItemCountCorrect();
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Mark all as completed", () => {
  test("should allow me to mark all items as completed", async ({
    todoApp,
  }) => {
    // Create todos
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Complete all todos.
    await todoApp.markAllAsCompleted();

    // Ensure all todos have 'completed' class.
    await todoApp.verifyTasksDisplayCompleted();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(3);
  });

  test("should allow me to clear the complete state of all items", async ({
    todoApp,
  }) => {
    // Create todos
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark all as complete using shortcut button
    await todoApp.markAllAsCompleted();

    // Mark all as not-complete using shortcut button
    await todoApp.markAllAsNotCompleted();

    // Verify all display as not complete
    await todoApp.verifyTasksDisplayNotCompleted();
  });

  test("complete all checkbox should update state when items are completed / cleared", async ({
    todoApp,
  }) => {
    // Create todos
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark all as complete using shortcut button
    await todoApp.markAllAsCompleted();

    // Ensure all todos have 'completed' class.
    await todoApp.verifyTasksDisplayCompleted();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(3);

    // Uncheck first todo.
    await todoApp.uncheckToDo(0);

    // toggleAll is not checked.
    await todoApp.verifyToggleAllNotChecked();

    await todoApp.checkToDo(0);
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(3);

    // Assert the toggle all is checked again.
    await todoApp.verifyToggleAllChecked();
    await todoApp.verifyTasksDisplayCompleted();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(3);
  });
});

test.describe("Item", () => {
  test("should allow me to mark items as complete", async ({ todoApp }) => {
    // Create two todos
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Check first item.
    await todoApp.checkToDo(0);
    await todoApp.verifyToDoComplete(0);

    // Check second item.
    await todoApp.verifyToDoNotComplete(1);
    await todoApp.checkToDo(1);

    // Assert all completed.
    await todoApp.verifyToggleAllChecked();
    await todoApp.verifyTasksDisplayCompleted();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(2);
  });

  test("should allow me to un-mark items as complete", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    await todoApp.checkToDo(0);
    await todoApp.verifyToDoComplete(0);
    await todoApp.verifyToDoNotComplete(1);
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);

    await todoApp.uncheckToDo(0);
    await todoApp.verifyToDoNotComplete(0);
    await todoApp.verifyToDoNotComplete(1);
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(0);
  });

  test("should allow me to edit an item", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Edit the second todo
    await todoApp.editToDo(1, "Enter");

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Editing", () => {
  test("should hide other controls when editing", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Controls hidden when editing
    await todoApp.verifyControlsDisabledWhenEditing(0);
  });

  test("should save edits on blur", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Edit the second todo
    await todoApp.editToDo(1, "Blur");

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });

  test("should trim entered text", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Edit the second todo
    await todoApp.editToDo(1, "Blur", true);

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });

  test("should remove the item if an empty text string was entered", async ({
    todoApp,
  }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Edit the second todo to blank which removes it
    await todoApp.editToDoToBlank(1, "Enter");

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });

  test("should cancel edits on escape", async ({ todoApp }) => {
    // Create two items.
    await todoApp.visit();
    await todoApp.createNewToDos(2);

    // Edit the second todo but use escape key to not save changes
    await todoApp.editToDo(1, "Escape", true);

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Counter", () => {
  test("should display the current number of todo items", async ({
    todoApp,
  }) => {
    // Create the first item
    await todoApp.visit();
    await todoApp.createNewToDos(1);
    await todoApp.verifyItemCountCorrect();

    // Create second item
    await todoApp.createNewToDos(1);
    await todoApp.verifyItemCountCorrect();

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Clear completed button", () => {
  test("should display the correct text", async ({ todoApp }) => {
    // Create the first item
    await todoApp.visit();
    await todoApp.createNewToDos(1);
    await todoApp.checkToDo(0);

    // Make sure 'Clear completed' is visible
    await todoApp.verifyClearCompletedButtonDisplayed();
  });

  test("should remove completed items when clicked", async ({ todoApp }) => {
    // Create the first item
    await todoApp.visit();
    await todoApp.createNewToDos(2);
    await todoApp.checkToDo(0);

    // Make sure 'Clear completed' is visible
    await todoApp.verifyClearCompletedButtonDisplayed();

    // Click clear completed
    await todoApp.clearCompleted();

    // Make sure 'Clear completed' is no longer visible
    await todoApp.verifyClearCompletedButtonNotDisplayed();

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Persistence", () => {
  test("should persist its data", async ({ todoApp }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);
    await todoApp.checkToDo(1);

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();

    // Refresh page
    await todoApp.page.reload();

    // Make sure the todos are correctly displayed
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
  });
});

test.describe("Routing", () => {
  test("should allow me to display active items", async ({ todoApp }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark one as done
    await todoApp.checkToDo(1);

    // Make sure all displayed and in storage
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);

    // Visit 'active' view and make sure only active displayed
    await todoApp.viewActive();
    await todoApp.verifyActiveToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);
  });

  test("should respect the back button", async ({ todoApp }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark one as done
    await todoApp.checkToDo(1);

    // Make sure all displayed and in storage
    await todoApp.verifyAllToDosDisplayed();

    // Visit 'active' view and make sure only active displayed
    await todoApp.viewActive();
    await todoApp.verifyActiveToDosDisplayed();

    // Use browser back to ensure active is now displayed
    await todoApp.page.goBack();

    // Make sure all displayed and in storage
    await todoApp.verifyAllToDosDisplayed();

    // Visit 'completed' view and make sure only complete displayed
    await todoApp.viewCompleted();
    await todoApp.verifyCompletedToDosDisplayed();

    // Use browser back to ensure active is now displayed
    await todoApp.page.goBack();

    // Make sure all displayed and in storage
    await todoApp.verifyAllToDosDisplayed();
  });

  test("should allow me to display completed items", async ({ todoApp }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark one as done
    await todoApp.checkToDo(1);

    // Make sure all displayed and in storage
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);

    // Visit 'completed' view and make sure only completed displayed
    await todoApp.viewCompleted();
    await todoApp.verifyCompletedToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);
  });

  test("should allow me to display all items", async ({ todoApp }) => {
    // Create three items.
    await todoApp.visit();
    await todoApp.createNewToDos(3);

    // Mark one as done
    await todoApp.checkToDo(1);

    // Visit 'all' view and make sure only active displayed
    await todoApp.viewAll();
    await todoApp.verifyAllToDosDisplayed();
    await todoApp.verifyLocalStorage();
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(1);
  });
});
