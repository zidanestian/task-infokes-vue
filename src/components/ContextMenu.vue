<template>
  <div
    v-if="show"
    class="context-menu"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
    data-testid="context-menu"
  >
    <div class="list-group">
      <button
        class="list-group-item list-group-item-action"
        @click="$emit('new-folder')"
        data-testid="new-folder-btn"
      >
        <i class="bi bi-folder-plus me-2"></i>
        New Folder
      </button>
      <button
        v-if="selectedItem"
        class="list-group-item list-group-item-action"
        @click="$emit('rename')"
        data-testid="rename-btn"
      >
        <i class="bi bi-pencil me-2"></i>
        Rename
      </button>
      <button
        v-if="selectedItem"
        class="list-group-item list-group-item-action"
        @click="$emit('copy')"
        data-testid="copy-btn"
      >
        <i class="bi bi-files me-2"></i>
        Copy
      </button>
      <button
        v-if="selectedItem"
        class="list-group-item list-group-item-action"
        @click="$emit('cut')"
        data-testid="cut-btn"
      >
        <i class="bi bi-scissors me-2"></i>
        Cut
      </button>
      <button
        v-if="canPaste"
        class="list-group-item list-group-item-action"
        @click="$emit('paste')"
        data-testid="paste-btn"
      >
        <i class="bi bi-clipboard-plus me-2"></i>
        Paste
      </button>
      <button
        v-if="selectedItem"
        class="list-group-item list-group-item-action text-danger"
        @click="$emit('delete')"
        data-testid="delete-btn"
      >
        <i class="bi bi-trash me-2"></i>
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';

interface Position {
  x: number;
  y: number;
}

interface FileItem {
  id: number;
  name: string;
  type: string;
  path: string;
  parent_id: number | null;
  is_directory: boolean;
}

defineProps<{
  show: boolean;
  position: Position;
  selectedItem: FileItem | null;
  canPaste: boolean;
}>();

defineEmits<{
  'new-folder': [];
  'copy': [];
  'cut': [];
  'paste': [];
  'delete': [];
  'rename': [];
}>();
</script>

<script lang="ts">
export default defineComponent({
  name: 'ContextMenu'
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.list-group {
  border-radius: 4px;
  overflow: hidden;
}

.list-group-item {
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item i {
  font-size: 1.1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #343a40;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .list-group-item {
    background-color: #343a40;
    color: #f8f9fa;
  }

  .list-group-item:hover {
    background-color: #495057;
  }

  .list-group-item.text-danger {
    color: #ff6b6b !important;
  }

  .list-group-item.text-danger:hover {
    background-color: rgba(255, 107, 107, 0.1);
  }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .context-menu {
    min-width: 180px;
  }

  .list-group-item {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .list-group-item i {
    font-size: 1rem;
  }
}
</style> 