<template>
  <div class="folder-tree-item">
    <div
      class="folder-item"
      :class="{ 'active': currentFolder === folder.id }"
      @click="handleClick"
      :data-testid="`folder-item-${folder.id}`"
    >
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-sm p-0 toggle-btn"
          @click.stop="toggleExpanded"
          v-if="hasChildren"
          data-testid="toggle-btn"
        >
          <i class="bi" :class="expanded ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
        </button>
        <i class="bi bi-folder2-open" v-if="expanded"></i>
        <i class="bi bi-folder2" v-else></i>
        <span class="folder-name">{{ folder.name }}</span>
      </div>
    </div>
    <div v-if="expanded" class="ms-4">
      <div v-for="child in children" :key="child.id">
        <FolderTreeItem
          :folder="child"
          :current-folder="currentFolder"
          @select="$emit('select', $event)"
          ref="childItems"
          data-testid="folder-tree-item"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import axios from 'axios';

interface Folder {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
}

const props = defineProps<{
  folder: Folder;
  currentFolder: number | null;
}>();

const emit = defineEmits<{
  select: [folderId: number];
}>();

const expanded = ref(false);
const hasChildren = ref(false);
const children = ref<Folder[]>([]);
const childItems = ref<any[]>([]);

const loadChildren = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/files`, {
      params: { parent_id: props.folder.id }
    });
    const folders = response.data.data.filter((item: any) => item.is_directory);
    hasChildren.value = folders.length > 0;
    children.value = folders;
  } catch (error) {
    console.error('Error loading subfolders:', error);
  }
};

const toggleExpanded = async (event: Event) => {
  event.stopPropagation();
  expanded.value = !expanded.value;
  if (expanded.value && children.value.length === 0) {
    await loadChildren();
  }
};

const handleClick = () => {
  emit('select', props.folder.id);
};

const refreshFolder = async () => {
  await loadChildren();
  // Refresh all child items
  if (childItems.value) {
    childItems.value.forEach(item => {
      if (item && item.refreshFolder) {
        item.refreshFolder();
      }
    });
  }
};

onMounted(async () => {
  await loadChildren();
});

defineExpose({
  expanded,
  hasChildren,
  children,
  toggleExpanded,
  refreshFolder
});
</script>

<script lang="ts">
export default defineComponent({
  name: 'FolderTreeItem'
});
</script>

<style scoped>
.folder-tree-item {
  margin-bottom: 4px;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
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

.toggle-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  transition: transform 0.2s ease;
}

.toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.bi {
  font-size: 1.1rem;
}

.bi-folder2,
.bi-folder2-open {
  color: #ffc107;
}

.folder-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .folder-item {
    padding: 4px 6px;
    font-size: 0.9rem;
  }

  .toggle-btn {
    width: 16px;
    height: 16px;
  }

  .bi {
    font-size: 1rem;
  }

  .folder-name {
    max-width: 120px;
  }

  .ms-4 {
    margin-left: 1rem !important;
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

  .toggle-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style> 