/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      rightClickContextMenu(selector: string): Chainable<Element>;
      createFolder(folderName: string): Chainable<Element>;
      renameItem(oldName: string, newName: string): Chainable<Element>;
      getByTestId(testId: string): Chainable<Element>;
    }
  }
}