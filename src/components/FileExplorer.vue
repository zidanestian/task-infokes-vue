<template>
  <div class="file-explorer" @click="hideContextMenu" @contextmenu.prevent="hideContextMenu">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 border-end">
          <div class="folder-tree p-3">
            <h5>Folders</h5>
            <FolderTree
              :current-folder="currentFolder"
              @select="navigateToFolder"
              @navigate="navigateToFolder"
              ref="folderTreeRef"
              data-testid="folder-tree"
            />
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" class="p-3">
            <ol class="breadcrumb mb-0" data-testid="breadcrumb">
              <li class="breadcrumb-item">
                <a href="#" @click.prevent="navigateToRoot">Root</a>
              </li>
              <li
                v-for="(item, index) in breadcrumbs"
                :key="index"
                class="breadcrumb-item"
                :class="{ active: index === breadcrumbs.length - 1 }"
              >
                <a
                  v-if="index !== breadcrumbs.length - 1"
                  href="#"
                  @click.prevent="navigateToFolder(item.id)"
                >{{ item.name }}</a>
                <span v-else>{{ item.name }}</span>
              </li>
            </ol>
          </nav>

          <!-- Files and Folders Grid -->
          <div
            class="files-grid p-3"
            data-testid="files-grid"
            @contextmenu.prevent.stop="showContextMenu($event)"
          >
            <div class="row g-3">
              <div
                v-for="item in currentItems"
                :key="item.id"
                class="col-md-3 col-sm-4 col-6"
              >
                <div
                  class="file-item p-2"
                  :class="{ selected: selectedItem?.id === item.id }"
                  @click="selectItem(item)"
                  @dblclick="openItem(item)"
                  @contextmenu.prevent.stop="showContextMenu($event, item)"
                >
                  <div class="text-center mb-2">
                    <i
                      class="bi"
                      :class="item.is_directory ? 'bi-folder-fill text-warning' : 'bi-file-earmark text-primary'"
                      style="font-size: 2rem;"
                    ></i>
                  </div>
                  <div class="text-center text-truncate">{{ item.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :show="showMenu"
      :position="menuPosition"
      :selected-item="selectedItem"
      :can-paste="!!clipboardItem"
      @new-folder="createNewFolder"
      @copy="copyItem"
      @cut="cutItem"
      @paste="pasteItem"
      @delete="deleteSelectedItem"
      @rename="handleRename"
    />

    <!-- New Folder Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showNewFolderModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Folder</h5>
            <button type="button" class="btn-close" @click="closeNewFolderModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Folder Name</label>
              <input
                ref="newFolderInput"
                type="text"
                class="form-control"
                v-model="newFolderName"
                @keyup.enter="submitNewFolder"
                placeholder="New Folder"
                data-testid="new-folder-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeNewFolderModal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="submitNewFolder">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showNewFolderModal"></div>

    <!-- Rename Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showRenameModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rename Item</h5>
            <button type="button" class="btn-close" @click="closeRenameModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">New Name</label>
              <input
                ref="renameInput"
                type="text"
                class="form-control"
                v-model="newItemName"
                @keyup.enter="submitRename"
                placeholder="Enter new name"
                data-testid="rename-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeRenameModal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="submitRename">
              Rename
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showRenameModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, nextTick } from 'vue';
import axios from 'axios';
import ContextMenu from './ContextMenu.vue';
import FolderTree from './FolderTree.vue';

interface FileItem {
  id: number;
  name: string;
  type: string;
  path: string;
  parent_id: number | null;
  is_directory: boolean;
  content_type: string | null;
  created_at: string;
  updated_at: string;
}

const currentItems = ref<FileItem[]>([]);
const selectedItem = ref<FileItem | null>(null);
const currentFolder = ref<number | null>(null);
const breadcrumbs = ref<FileItem[]>([]);
const clipboardItem = ref<{ item: FileItem; action: 'copy' | 'cut' } | null>(null);

// Context Menu
const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

// New Folder Modal
const showNewFolderModal = ref(false);
const newFolderName = ref('');
const newFolderInput = ref(null);

// Rename Modal
const showRenameModal = ref(false);
const newItemName = ref('');
const renameInput = ref<HTMLInputElement | null>(null);

const folderTreeRef = ref<any>(null);

onMounted(() => {
  loadFiles();
  // Close context menu when clicking outside
  document.addEventListener('click', hideContextMenu);
});

async function loadFiles(parentId: number | null = null) {
  try {
    const response = await axios.get(`http://localhost:3000/api/files`, {
      params: { parent_id: parentId }
    });
    currentItems.value = response.data.data;
    currentFolder.value = parentId;
    await loadBreadcrumbs(parentId);
  } catch (error) {
    console.error('Error loading files:', error);
  }
}

async function loadBreadcrumbs(parentId: number | null) {
  breadcrumbs.value = [];
  if (!parentId) return;

  try {
    let currentId = parentId;
    while (currentId) {
      const response = await axios.get(`http://localhost:3000/api/files/${currentId}`);
      const folder = response.data.data;
      breadcrumbs.value.unshift(folder);
      currentId = folder.parent_id;
    }
  } catch (error) {
    console.error('Error loading breadcrumbs:', error);
  }
}

function showContextMenu(event: MouseEvent, item?: FileItem) {
  event.preventDefault();
  event.stopPropagation();
  
  // Hide any existing context menu first
  hideContextMenu();
  
  // Calculate position
  const x = event.clientX;
  const y = event.clientY;
  
  // Update state
  menuPosition.value = { x, y };
  selectedItem.value = item || null;
  showMenu.value = true;
  
  // Add one-time click listener to hide menu
  const hideOnClick = (e: MouseEvent) => {
    if (!e.target || !(e.target as HTMLElement).closest('[data-testid="context-menu"]')) {
      hideContextMenu();
      document.removeEventListener('click', hideOnClick);
    }
  };
  document.addEventListener('click', hideOnClick);
}

function hideContextMenu() {
  showMenu.value = false;
  if (!selectedItem.value) {
    selectedItem.value = null;
  }
}

function selectItem(item: FileItem) {
  selectedItem.value = item;
}

function openItem(item: FileItem) {
  if (item.is_directory) {
    loadFiles(item.id);
  }
}

const navigateToFolder = async (folderId: number | null) => {
  currentFolder.value = folderId;
  await loadFiles(folderId);
  
  // Update breadcrumbs
  if (folderId === null) {
    breadcrumbs.value = [];
  } else {
    await loadBreadcrumbs(folderId);
  }
};

const navigateToRoot = async () => {
  await navigateToFolder(null);
};

// Context Menu Actions
function createNewFolder() {
  showNewFolderModal.value = true;
  nextTick(() => {
    if (newFolderInput.value) {
      newFolderInput.value.focus();
    }
  });
}

const getUniqueFileName = async (name: string, parentId: number | null) => {
  const response = await axios.get('http://localhost:3000/api/files', {
    params: { parent_id: parentId }
  });
  const existingFiles = response.data.data;
  
  let baseName = name;
  let extension = '';
  
  // Handle file extensions if present
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex > 0) {
    baseName = name.substring(0, lastDotIndex);
    extension = name.substring(lastDotIndex);
  }
  
  let counter = 1;
  let newName = name;
  
  while (existingFiles.some((file: any) => file.name === newName)) {
    newName = `${baseName} (${counter})${extension}`;
    counter++;
  }
  
  return newName;
};

async function submitNewFolder() {
  if (!newFolderName.value.trim()) return;

  try {
    const uniqueName = await getUniqueFileName(newFolderName.value, currentFolder.value);
    await axios.post('http://localhost:3000/api/files/folder', {
      name: uniqueName,
      parent_id: currentFolder.value
    });
    closeNewFolderModal();
    loadFiles(currentFolder.value);
    if (folderTreeRef.value) {
      folderTreeRef.value.refreshTree();
    }
  } catch (error) {
    console.error('Error creating folder:', error);
  }
}

function closeNewFolderModal() {
  showNewFolderModal.value = false;
  newFolderName.value = '';
}

async function copyItem() {
  if (selectedItem.value) {
    clipboardItem.value = { item: selectedItem.value, action: 'copy' };
  }
}

function cutItem() {
  if (selectedItem.value) {
    clipboardItem.value = { item: selectedItem.value, action: 'cut' };
  }
}

async function pasteItem() {
  if (!clipboardItem.value) return;

  try {
    const { item, action } = clipboardItem.value;
    const uniqueName = await getUniqueFileName(item.name, currentFolder.value);
    
    // For copy action, create a new item
    if (action === 'copy') {
      if (item.is_directory) {
        await axios.post('http://localhost:3000/api/files/folder', {
          name: uniqueName,
          parent_id: currentFolder.value
        });
      } else {
        // Handle file copy here if needed
      }
    } else {
      // For cut action, move the existing item
      await axios.put(`http://localhost:3000/api/files/${item.id}/move`, {
        parent_id: currentFolder.value
      });
    }

    // Only clear clipboard for cut operation
    if (action === 'cut') {
      clipboardItem.value = null;
    }

    loadFiles(currentFolder.value);
    if (folderTreeRef.value) {
      folderTreeRef.value.refreshTree();
    }
  } catch (error) {
    console.error('Error pasting item:', error);
  }
}

async function deleteSelectedItem() {
  if (!selectedItem.value || !confirm('Are you sure you want to delete this item?')) return;

  try {
    await axios.delete(`http://localhost:3000/api/files/${selectedItem.value.id}`);
    selectedItem.value = null;
    loadFiles(currentFolder.value);
    if (folderTreeRef.value) {
      folderTreeRef.value.refreshTree();
    }
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}

function handleRename() {
  if (selectedItem.value) {
    newItemName.value = selectedItem.value.name;
    showRenameModal.value = true;
    nextTick(() => {
      if (renameInput.value) {
        renameInput.value.focus();
        renameInput.value.select();
      }
    });
  }
}

function closeRenameModal() {
  showRenameModal.value = false;
  newItemName.value = '';
}

async function submitRename() {
  if (!selectedItem.value || !newItemName.value.trim()) return;

  try {
    const response = await axios.put(`http://localhost:3000/api/files/${selectedItem.value.id}/rename`, {
      name: newItemName.value
    });

    if (response.data.success) {
      closeRenameModal();
      loadFiles(currentFolder.value);
      if (folderTreeRef.value) {
        folderTreeRef.value.refreshTree();
      }
    } else {
      alert('Failed to rename item: ' + response.data.error);
    }
  } catch (error) {
    console.error('Error renaming item:', error);
    alert('Failed to rename item');
  }
}
</script>

<script lang="ts">
export default defineComponent({
  name: 'FileExplorer'
});
</script>

<style scoped>
.file-explorer {
  height: calc(100vh - 56px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.folder-tree {
  height: 100%;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.files-grid {
  height: calc(100vh - 140px);
  overflow-y: auto;
  padding: 1rem;
}

.file-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.75rem;
}

.file-item:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-2px);
}

.file-item.selected {
  background-color: #e9ecef;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .file-explorer {
    height: calc(100vh - 48px);
  }

  .folder-tree {
    max-height: 200px;
    border-bottom: 1px solid #dee2e6;
  }

  .files-grid {
    height: auto;
    flex: 1;
  }

  .file-item {
    padding: 0.5rem;
  }

  .file-item i {
    font-size: 1.5rem !important;
  }

  .breadcrumb {
    font-size: 0.875rem;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .col-md-3 {
    width: 100%;
  }

  .col-md-9 {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .file-explorer {
    background-color: #212529;
    color: #f8f9fa;
  }

  .folder-tree {
    background-color: #343a40;
    border-color: #495057;
  }

  .file-item {
    background-color: #343a40;
    border-color: #495057;
    color: #f8f9fa;
  }

  .file-item:hover {
    background-color: #495057;
  }

  .file-item.selected {
    background-color: #0d6efd;
    color: white;
  }
}
</style> 