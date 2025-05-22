<template>
  <div class="folder-tree">
    <div 
      class="folder-item" 
      :class="{ 'active': !currentFolder }" 
      @click="handleRootClick"
      data-testid="root-folder"
    >
      <i class="bi bi-folder2"></i> Root
    </div>
    <div v-for="folder in folders" :key="folder.id" class="ms-3">
      <FolderTreeItem
        :folder="folder"
        :current-folder="currentFolder"
        @select="handleFolderSelect"
        ref="treeItems"
        data-testid="folder-tree-item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import axios from 'axios';
import FolderTreeItem from './FolderTreeItem.vue';

interface Folder {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
}

const props = defineProps<{
  currentFolder: number | null;
}>();

const emit = defineEmits<{
  select: [folderId: number | null];
}>();

const folders = ref<Folder[]>([]);
const treeItems = ref<any[]>([]);

const loadFolders = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/files');
    folders.value = response.data.data.filter((item: any) => item.is_directory);
  } catch (error) {
    console.error('Error loading folders:', error);
  }
};

const handleRootClick = () => {
  emit('select', null);
};

const handleFolderSelect = (folderId: number) => {
  emit('select', folderId);
};

const refreshTree = async () => {
  await loadFolders();
  // Refresh all child items
  if (treeItems.value) {
    treeItems.value.forEach(item => {
      if (item && item.refreshFolder) {
        item.refreshFolder();
      }
    });
  }
};

onMounted(async () => {
  await loadFolders();
});

defineExpose({
  folders,
  refreshTree
});
</script>

<script lang="ts">
export default defineComponent({
  name: 'FolderTree'
});
</script>

<style scoped>
.folder-tree {
  padding: 8px;
  overflow-y: auto;
  height: 100%;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.folder-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.folder-item.active {
  background-color: #e9ecef;
  font-weight: bold;
}

.bi {
  font-size: 1.1rem;
  color: #ffc107;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .folder-tree {
    padding: 4px;
  }

  .folder-item {
    padding: 6px;
    font-size: 0.9rem;
  }

  .bi {
    font-size: 1rem;
  }

  .ms-3 {
    margin-left: 0.5rem !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .folder-item {
    color: #f8f9fa;
  }

  .folder-item:hover {
    background-color: #343a40;
  }

  .folder-item.active {
    background-color: #0d6efd;
    color: white;
  }
}
</style> 