import { defineStore } from 'pinia';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TaskInput {
  title: string;
  description?: string;
  status?: string;
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTasks() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:3000/api/tasks');
        this.tasks = response.data.data;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createTask(task: TaskInput) {
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:3000/api/tasks', task);
        this.tasks.push(response.data.data);
        return response.data.data;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(id: number, task: TaskInput) {
      this.loading = true;
      try {
        const response = await axios.put(`http://localhost:3000/api/tasks/${id}`, task);
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasks[index] = response.data.data;
        }
        return response.data.data;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id: number) {
      this.loading = true;
      try {
        await axios.delete(`http://localhost:3000/api/tasks/${id}`);
        this.tasks = this.tasks.filter(task => task.id !== id);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 