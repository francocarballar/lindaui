import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DateDivider } from './date-divider';
import { MessageBubble } from './message-bubble';
import { ChatAvatar } from './chat-avatar';
import { ImageLightbox } from './image-lightbox';
import { ConversationList } from './conversation-list';

beforeEach(() => vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => vi.unstubAllGlobals());
const date = new Date();
test('date dividers identify today, yesterday and older calendar days', () => {
  const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
  const { rerender } = render(<DateDivider date={date} />);
  expect(screen.getByText('Hoy')).toBeInTheDocument();
  rerender(<DateDivider date={yesterday} />);
  expect(screen.getByText('Ayer')).toBeInTheDocument();
  rerender(<DateDivider date="2020-01-02T12:00:00" />);
  expect(screen.getByText('02/01/2020')).toBeInTheDocument();
});

test('generic PDF messages use the attachment fallback and optional author tags', () => {
  const { rerender } = render(<MessageBubble message={{ id: 'pdf', side: 'left', timestamp: date, text: 'Report', media: { kind: 'pdf', url: '/report.pdf' } }} />);
  expect(screen.getByRole('link', { name: /Documento adjunto/ })).toHaveAttribute('href', '/report.pdf');
  rerender(<MessageBubble message={{ id: 'pdf', side: 'right', timestamp: date, text: 'Report', authorTag: 'Assistant', media: { kind: 'pdf', url: '/report.pdf', label: 'Results' } }} />);
  expect(screen.getByRole('link', { name: /Results/ })).toBeInTheDocument();
  expect(screen.getByText('Assistant', { exact: true })).toBeInTheDocument();
});

test('avatars and image previews support omitted customization', () => {
  render(<><ChatAvatar name="Ada Lovelace" classNames={{ base: 'avatar-base' }} /><ImageLightbox src="/preview.png" /></>);
  expect(screen.getByText('AL')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Media' })).toHaveAttribute('src', '/preview.png');
});

test('list fallback timestamps and omitted avatar renderers keep items selectable', () => {
  const labels = { loading: 'Loading', periods: { Hoy: 'Today', Ayer: 'Yesterday', 'Esta semana': 'This week', 'Este mes': 'This month', 'Más antiguos': 'Older' } };
  render(<ConversationList items={[{ id: 'ada', title: 'Ada' }]} searchValue="" onSearchChange={vi.fn()} onItemSelect={vi.fn()} labels={labels} />);
  expect(screen.getByText('Today')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Ada/ })).toBeInTheDocument();
});

test('avatars accept an image without a customization object and empty names remain safe', () => {
  const { rerender } = render(<ChatAvatar name="Ada" src="/ada.png" />);
  // jsdom never loads the URL, so the real avatar displays its initials fallback.
  expect(screen.getByText('A')).toBeInTheDocument();
  rerender(<ChatAvatar name="" />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('generic bubbles render image and audio attachments on both conversation sides', () => {
  const { rerender } = render(<MessageBubble message={{ id: 'image', side: 'left', timestamp: date, text: 'Picture', media: { kind: 'image', url: '/preview.png' } }} />);
  expect(screen.getByRole('button', { name: 'Ver imagen: Media compartida' })).toBeInTheDocument();
  rerender(<MessageBubble message={{ id: 'audio', side: 'left', timestamp: date, text: 'Voice', media: { kind: 'audio', url: '/voice.wav' } }} />);
  expect(screen.getByRole('button', { name: 'Reproducir audio' })).toBeInTheDocument();
  rerender(<MessageBubble message={{ id: 'audio', side: 'right', timestamp: date, text: 'Reply', media: { kind: 'audio', url: '/reply.wav' } }} />);
  expect(screen.getByRole('button', { name: 'Reproducir audio' })).toBeInTheDocument();
});

test('conversation lists explicitly present loading and empty results', () => {
  const labels = { loading: 'Loading conversations', periods: { Hoy: 'Today', Ayer: 'Yesterday', 'Esta semana': 'This week', 'Este mes': 'This month', 'Más antiguos': 'Older' } };
  const props = { items: [], searchValue: '', onSearchChange: vi.fn(), onItemSelect: vi.fn(), labels };
  const { rerender } = render(<ConversationList {...props} isLoading />);
  expect(screen.getByText('Loading conversations')).toBeInTheDocument();
  rerender(<ConversationList {...props} emptyMessage="No conversations" />);
  expect(screen.getByText('No conversations')).toBeInTheDocument();
});
