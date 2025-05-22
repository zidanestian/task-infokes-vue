import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import ContextMenu from '../ContextMenu.vue';

describe('ContextMenu', () => {
  it('renders when show is true', () => {
    const { getByTestId } = render(ContextMenu, {
      props: {
        show: true,
        position: { x: 0, y: 0 },
        selectedItem: null,
        canPaste: false
      }
    });

    expect(getByTestId('context-menu')).toBeTruthy();
  });

  it('does not render when show is false', () => {
    const { queryByTestId } = render(ContextMenu, {
      props: {
        show: false,
        position: { x: 0, y: 0 },
        selectedItem: null,
        canPaste: false
      }
    });

    expect(queryByTestId('context-menu')).toBeNull();
  });

  it('emits events when menu items are clicked', async () => {
    const { getByTestId, emitted } = render(ContextMenu, {
      props: {
        show: true,
        position: { x: 0, y: 0 },
        selectedItem: { id: 1, name: 'test' },
        canPaste: false
      }
    });

    // Click new folder button
    await getByTestId('new-folder-btn').click();
    expect(emitted()['new-folder']).toBeTruthy();

    // Click rename button
    await getByTestId('rename-btn').click();
    expect(emitted().rename).toBeTruthy();

    // Click copy button
    await getByTestId('copy-btn').click();
    expect(emitted().copy).toBeTruthy();

    // Click cut button
    await getByTestId('cut-btn').click();
    expect(emitted().cut).toBeTruthy();

    // Click delete button
    await getByTestId('delete-btn').click();
    expect(emitted().delete).toBeTruthy();
  });

  it('shows paste option only when canPaste is true', () => {
    const { getByTestId } = render(ContextMenu, {
      props: {
        show: true,
        position: { x: 0, y: 0 },
        selectedItem: null,
        canPaste: true
      }
    });

    expect(getByTestId('paste-btn')).toBeTruthy();
  });

  it('hides paste option when canPaste is false', () => {
    const { queryByTestId } = render(ContextMenu, {
      props: {
        show: true,
        position: { x: 0, y: 0 },
        selectedItem: null,
        canPaste: false
      }
    });

    expect(queryByTestId('paste-btn')).toBeNull();
  });
}); 