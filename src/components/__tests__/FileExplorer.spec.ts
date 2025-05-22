import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/vue';
import FileExplorer from '../FileExplorer.vue';
import axios from 'axios';

// Mock the child components
vi.mock('../FolderTree.vue', () => ({
  default: {
    name: 'FolderTree',
    template: '<div data-testid="folder-tree">FolderTree Mock</div>',
    methods: {
      refreshTree: vi.fn()
    }
  }
}));

vi.mock('../ContextMenu.vue', () => ({
  default: {
    name: 'ContextMenu',
    template: `
      <div v-if="show" data-testid="context-menu">
        <button data-testid="new-folder-btn" @click="$emit('new-folder')">New Folder</button>
        <button data-testid="rename-btn" v-if="selectedItem" @click="$emit('rename')">Rename</button>
        <button data-testid="copy-btn" v-if="selectedItem" @click="$emit('copy')">Copy</button>
        <button data-testid="cut-btn" v-if="selectedItem" @click="$emit('cut')">Cut</button>
        <button data-testid="paste-btn" v-if="canPaste" @click="$emit('paste')">Paste</button>
        <button data-testid="delete-btn" v-if="selectedItem" @click="$emit('delete')">Delete</button>
      </div>
    `,
    props: ['show', 'position', 'selectedItem', 'canPaste']
  }
}));

// Mock axios
vi.mock('axios');

describe('FileExplorer', () => {
  const mockFiles = [
    {
      id: 1,
      name: 'Documents',
      type: 'folder',
      path: '/Documents',
      parent_id: null,
      is_directory: true,
      content_type: null,
      created_at: '2024-03-14',
      updated_at: '2024-03-14'
    },
    {
      id: 2,
      name: 'Pictures',
      type: 'folder',
      path: '/Pictures',
      parent_id: null,
      is_directory: true,
      content_type: null,
      created_at: '2024-03-14',
      updated_at: '2024-03-14'
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Setup default axios mock responses
    (axios.get as any).mockResolvedValue({
      data: { success: true, data: mockFiles }
    });

    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    // Restore window.confirm
    vi.unstubAllGlobals();
  });

  it('renders the file explorer layout', async () => {
    const { getByText, getByTestId } = render(FileExplorer);
    
    // Wait for the component to be mounted and data to be loaded
    await waitFor(() => {
      expect(getByText('Folders')).toBeTruthy();
      expect(getByText('Root')).toBeTruthy();
      expect(getByTestId('folder-tree')).toBeTruthy();
    });
  });

  it('loads and displays files', async () => {
    const { findByText } = render(FileExplorer);
    
    // Wait for the files to be loaded
    const documentsElement = await findByText('Documents');
    const picturesElement = await findByText('Pictures');
    
    expect(documentsElement).toBeTruthy();
    expect(picturesElement).toBeTruthy();
  });

  it('shows context menu on right click', async () => {
    const { container, findByText, getByTestId } = render(FileExplorer);
    
    // Wait for files to load
    const documentsElement = await findByText('Documents');
    expect(documentsElement).toBeTruthy();

    // Find and right click the Documents folder
    await fireEvent.contextMenu(documentsElement);
    
    // Context menu should be visible
    await waitFor(() => {
      expect(getByTestId('context-menu')).toBeTruthy();
    });
  });

  it('opens rename modal when rename option is clicked', async () => {
    const { findByText, getByTestId, getByPlaceholderText } = render(FileExplorer);
    
    // Wait for files to load and trigger context menu
    const documentsElement = await findByText('Documents');
    await fireEvent.contextMenu(documentsElement);
    
    // Click rename option in context menu
    const renameButton = getByTestId('rename-btn');
    await fireEvent.click(renameButton);
    
    // Verify rename modal is shown
    await waitFor(() => {
      expect(findByText('Rename Item')).toBeTruthy();
      expect(getByPlaceholderText('Enter new name')).toBeTruthy();
    });
  });

  it('handles file renaming', async () => {
    const { findByText, getByTestId, getByPlaceholderText } = render(FileExplorer);
    
    // Mock the rename API call
    (axios.put as any).mockResolvedValueOnce({
      data: { success: true }
    });
    
    // Wait for files to load and trigger context menu
    const documentsElement = await findByText('Documents');
    await fireEvent.contextMenu(documentsElement);
    
    // Click rename option in context menu
    const renameButton = getByTestId('rename-btn');
    await fireEvent.click(renameButton);
    
    // Enter new name and submit
    const input = getByPlaceholderText('Enter new name');
    await fireEvent.update(input, 'New Documents');
    const submitButton = await findByText('Rename', { selector: 'button.btn-primary' });
    await fireEvent.click(submitButton);
    
    // Verify API was called
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/1/rename',
      { name: 'New Documents' }
    );
  });

  it('handles file deletion', async () => {
    const { findByText, getByTestId } = render(FileExplorer);
    
    // Mock the delete API call
    (axios.delete as any).mockResolvedValueOnce({
      data: { success: true }
    });
    
    // Mock confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    // Wait for files to load and trigger context menu
    const documentsElement = await findByText('Documents');
    await fireEvent.contextMenu(documentsElement);
    
    // Click delete option in context menu
    const deleteButton = getByTestId('delete-btn');
    await fireEvent.click(deleteButton);
    
    // Verify confirm was called
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
    
    // Verify API was called
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/1'
    );
  });
}); 