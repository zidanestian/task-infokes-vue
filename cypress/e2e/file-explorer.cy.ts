describe('File Explorer', () => {
  beforeEach(() => {
    // Kunjungi halaman dan tunggu sampai elemen utama muncul
    cy.visit('/');
    cy.get('[data-testid="files-grid"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="folder-tree"]', { timeout: 10000 }).should('be.visible');
    
    // Reset state sebelum setiap test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  // Custom command untuk menangani context menu
  const openContextMenu = (selector: string) => {
    cy.get(selector)
      .trigger('mousedown', { button: 2 })
      .trigger('contextmenu', { force: true });
    
    return cy.get('[data-testid="context-menu"]', { timeout: 10000 })
      .should('be.visible');
  };

  // Custom command untuk membuka context menu pada elemen yang mengandung teks
  const openContextMenuOnText = (text: string) => {
    cy.contains(text).should('be.visible').then(($el: JQuery<HTMLElement>) => {
      openContextMenu(`[data-testid="files-grid"] div:contains("${$el.text()}")`);
    });
  };

  it('displays the file explorer interface', () => {
    cy.contains('Folders').should('be.visible');
    cy.contains('Root').should('be.visible');
  });

  it('can create a new folder', () => {
    // Klik kanan di area kosong
    openContextMenu('[data-testid="files-grid"]');
    
    // Klik tombol New Folder
    cy.get('[data-testid="new-folder-btn"]')
      .should('be.visible')
      .click();
    
    // Isi nama folder dan tekan enter
    cy.get('[data-testid="new-folder-input"]')
      .should('be.visible')
      .type('Test Folder{enter}');
    
    // Verifikasi folder telah dibuat
    cy.contains('Test Folder', { timeout: 10000 }).should('be.visible');
  });

  it('can rename a folder', () => {
    // Buat folder baru dulu
    openContextMenu('[data-testid="files-grid"]');
    
    cy.get('[data-testid="new-folder-btn"]')
      .should('be.visible')
      .click();
    
    cy.get('[data-testid="new-folder-input"]')
      .should('be.visible')
      .type('Test Folder{enter}');
    
    // Tunggu folder muncul
    cy.contains('Test Folder')
      .should('be.visible')
      .wait(1000); // Tambah delay untuk memastikan folder sudah benar-benar ada
    
    // Klik kanan pada folder
    openContextMenuOnText('Test Folder');
    
    // Klik tombol rename
    cy.get('[data-testid="rename-btn"]')
      .should('be.visible')
      .click();
    
    // Isi nama baru
    cy.get('[data-testid="rename-input"]')
      .should('be.visible')
      .clear()
      .type('Renamed Folder{enter}');
    
    // Verifikasi folder telah di-rename
    cy.contains('Renamed Folder', { timeout: 10000 }).should('be.visible');
  });

  it('can navigate through folders', () => {
    // Klik folder Documents
    cy.contains('Documents').click();
    
    // Verifikasi breadcrumb
    cy.get('[data-testid="breadcrumb"]', { timeout: 10000 })
      .should('contain', 'Documents');
    
    // Kembali ke root
    cy.contains('Root').click();
    cy.get('[data-testid="breadcrumb"]')
      .should('not.contain', 'Documents');
  });

  it('can use the folder tree for navigation', () => {
    // Expand folder di tree
    cy.get('[data-testid="folder-tree"]')
      .contains('Documents')
      .parent()
      .find('[data-testid="toggle-btn"]')
      .should('be.visible')
      .click();
    
    // Tunggu subfolder muncul
    cy.get('[data-testid="folder-tree"]')
      .contains('Work')
      .should('be.visible')
      .click();
    
    // Verifikasi breadcrumb
    cy.get('[data-testid="breadcrumb"]', { timeout: 10000 })
      .should('contain', 'Documents')
      .should('contain', 'Work');
  });

  it('can copy and paste folders', () => {
    // Buat folder sumber
    openContextMenu('[data-testid="files-grid"]');
    
    cy.get('[data-testid="new-folder-btn"]')
      .should('be.visible')
      .click();
    
    cy.get('[data-testid="new-folder-input"]')
      .should('be.visible')
      .type('Source Folder{enter}');
    
    // Tunggu folder muncul
    cy.contains('Source Folder')
      .should('be.visible')
      .wait(1000); // Tambah delay untuk memastikan folder sudah benar-benar ada
    
    // Klik kanan pada folder
    openContextMenuOnText('Source Folder');
    
    // Klik tombol copy
    cy.get('[data-testid="copy-btn"]')
      .should('be.visible')
      .click();
    
    // Klik kanan di area kosong untuk paste
    openContextMenu('[data-testid="files-grid"]');
    
    cy.get('[data-testid="paste-btn"]')
      .should('be.visible')
      .click();
    
    // Verifikasi folder hasil copy
    cy.contains('Source Folder (1)', { timeout: 10000 }).should('be.visible');
  });

  it('can delete a folder', () => {
    // Buat folder untuk dihapus
    openContextMenu('[data-testid="files-grid"]');
    
    cy.get('[data-testid="new-folder-btn"]')
      .should('be.visible')
      .click();
    
    cy.get('[data-testid="new-folder-input"]')
      .should('be.visible')
      .type('Folder to Delete{enter}');
    
    // Tunggu folder muncul
    cy.contains('Folder to Delete')
      .should('be.visible')
      .wait(1000); // Tambah delay untuk memastikan folder sudah benar-benar ada
    
    // Klik kanan pada folder
    openContextMenuOnText('Folder to Delete');
    
    // Klik tombol delete
    cy.get('[data-testid="delete-btn"]')
      .should('be.visible')
      .click();
    
    // Konfirmasi penghapusan
    cy.on('window:confirm', () => true);
    
    // Verifikasi folder telah dihapus
    cy.contains('Folder to Delete').should('not.exist');
  });
}); 