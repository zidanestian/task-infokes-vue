/// <reference types="cypress" />

// Add any custom commands here
Cypress.Commands.add('rightClickContextMenu', (selector: string) => {
  cy.get(selector).rightclick();
});

// Example of a custom command for file operations
Cypress.Commands.add('createFolder', (folderName: string) => {
  cy.get('.files-grid').rightclick();
  cy.contains('New Folder').click();
  cy.get('input[placeholder="New Folder"]').type(`${folderName}{enter}`);
});

Cypress.Commands.add('renameItem', (oldName: string, newName: string) => {
  cy.contains(oldName).rightclick();
  cy.contains('Rename').click();
  cy.get('input[placeholder="Enter new name"]').clear().type(`${newName}{enter}`);
});

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
}); 