import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
const state = vi.hoisted(() => ({ isOver: false }));
vi.mock('@dnd-kit/core', async importOriginal => ({
  ...await importOriginal<typeof import('@dnd-kit/core')>(),
  useDroppable: () => ({ isOver: state.isOver, setNodeRef: () => {} }),
}));
import { KanbanColumn } from './kanban-column';

test('droppable column highlights an active drag target and clears it when the target changes', () => {
  const props = { id: 'todo', title: 'To do', entities: [], getEntityId: (item: { id: string }) => item.id, renderCard: () => null };
  const { rerender } = render(<KanbanColumn {...props} />);
  const target = screen.getByText('No items').previousElementSibling?.parentElement;
  expect(target).not.toHaveClass('bg-accent/10');
  state.isOver = true;
  rerender(<KanbanColumn {...props} />);
  expect(target).toHaveClass('bg-accent/10');
  state.isOver = false;
  rerender(<KanbanColumn {...props} />);
  expect(target).not.toHaveClass('bg-accent/10');
});
