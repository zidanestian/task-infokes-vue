<script setup lang="ts">
import FileExplorer from './components/FileExplorer.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
</script>

<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">File Explorer</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>

    <FileExplorer />
  </div>
</template>

<style>
@import 'bootstrap-icons/font/bootstrap-icons.css';

.app-container {
  min-height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 10px;
}

body {
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 1rem;
  }
  
  .navbar-brand {
    font-size: 1.1rem;
  }
}
</style>
