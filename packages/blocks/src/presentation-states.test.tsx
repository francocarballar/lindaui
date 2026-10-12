import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ChatLayout } from './chat-layout';
import { StatCard } from './stat-card';
import { ListItem } from './list-item';
import { MessageComposer } from './message-composer';
import { MessageBubble } from './message-bubble';
import { SplitWorkspace } from './split-workspace';

test.each(['sidebar', 'main', 'detail'] as const)('chat exposes the selected mobile panel %s', (activePanel) => {
  render(<ChatLayout sidebar={<p>Sidebar</p>} main={<p>Main</p>} detail={<p>Details</p>} activePanel={activePanel} />);
  expect(screen.getByText('Sidebar').parentElement).toHaveClass(activePanel === 'sidebar' ? 'block' : 'hidden');
  expect(screen.getByText('Main').parentElement).toHaveClass(activePanel === 'main' ? 'block' : 'hidden');
  expect(screen.getByText('Details').parentElement).toHaveClass(activePanel === 'detail' ? 'block' : 'hidden');
});

test('featured statistic supports minimal and loading states', () => {
  const { container, rerender } = render(<StatCard label="Revenue" value="$500" variant="featured" />);
  expect(screen.getByText('$500')).toBeInTheDocument();
  rerender(<StatCard label="Revenue" value="$500" variant="featured" loading />);
  expect(screen.getByText('Revenue')).toBeInTheDocument();
  expect(screen.queryByText('$500')).toBeNull();
  expect(container.querySelectorAll('.skeleton')).toHaveLength(3);
});

test('list items preserve optional content and default badge semantics', () => {
  const onSelect = vi.fn();
  render(<ListItem title="Invoice" selected leading={<span>Icon</span>} subtitle="Pending" meta="Yesterday" badge={{ label: 'New' }} showChevron onSelect={onSelect} />);
  const item = screen.getByRole('button', { name: /Invoice/ });
  expect(item).toHaveAttribute('aria-pressed', 'true');
  expect(item).toHaveTextContent('Pending');
  expect(item).toHaveTextContent('Yesterday');
  expect(item).toHaveTextContent('New');
  fireEvent.click(item);
  expect(onSelect).toHaveBeenCalledOnce();
});

test('empty message Enter never sends, while ordinary keystrokes are preserved', () => {
  const onSend = vi.fn();
  render(<MessageComposer value=" " onValueChange={vi.fn()} onSend={onSend} />);
  const input = screen.getByRole('textbox');
  expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false);
  expect(fireEvent.keyDown(input, { key: 'a' })).toBe(true);
  expect(onSend).not.toHaveBeenCalled();
});

test('media-only messages support default image and document metadata', () => {
  const { rerender } = render(<MessageBubble message={{ id: 'one', side: 'incoming', sentAt: '2026-10-12T10:00:00Z', media: { kind: 'image', url: '/image.png' } }} />);
  const image = screen.getByRole('button', { name: 'Abrir imagen' });
  fireEvent.click(image);
  expect(image.querySelector('img')).toHaveAttribute('alt', '');
  rerender(<MessageBubble message={{ id: 'one', side: 'incoming', sentAt: '2026-10-12T10:00:00Z', media: { kind: 'image', url: '/image.png', alt: 'Study image' } }} />);
  expect(screen.getByRole('button', { name: 'Study image' })).toBeInTheDocument();
  rerender(<MessageBubble message={{ id: 'two', side: 'incoming', sentAt: '2026-10-12T10:00:00Z', media: { kind: 'pdf', url: '/document.pdf' } }} />);
  expect(screen.getByRole('link', { name: 'Documento' })).toHaveAttribute('href', '/document.pdf');
});

test('workspace without a back destination renders only media and panel', () => {
  render(<SplitWorkspace media={<p>Image</p>} panel={<p>Record</p>} />);
  expect(screen.getByText('Image')).toBeInTheDocument();
  expect(screen.getByText('Record')).toBeInTheDocument();
  expect(screen.queryByRole('link')).toBeNull();
});

test('workspace uses two columns on desktop', () => {
  vi.stubGlobal('matchMedia', (media: string) => ({ matches: true, media, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => true }));
  try {
    const { container } = render(<SplitWorkspace media={<p>Media</p>} panel={<p>Panel</p>} />);
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
  } finally { vi.unstubAllGlobals(); }
});

test('voice messages expose a usable playback action', () => {
  render(<MessageBubble message={{ id: 'voice', side: 'incoming', sentAt: '2026-10-12T10:00:00Z', media: { kind: 'audio', url: '/voice.wav' } }} />);
  expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument();
});
