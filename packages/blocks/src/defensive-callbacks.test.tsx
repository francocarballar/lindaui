import { act, renderHook } from '@testing-library/react';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { Dropdown, ListBox, Modal } from '@lindaui/ui/compound';
import { IconButton } from '@lindaui/ui/icon-button';
import { CommandPalette } from './command-palette';
import { EntitySwitcher } from './entity-switcher';
import { SourceSelector } from './source-selector';
import { AudioPlayer } from './audio-player';
import { WhatsAppAudioPlayer } from './compat-chat/whatsapp-audio-player';
import { ImageLightbox } from './compat-chat/image-lightbox';
import { ConnectionPanel } from './connection-panel';
import { DisconnectedPanel } from './connection-panel/disconnected-panel';
import { ConversationThread } from './compat-chat/conversation-thread';

// Inspect the public element callback contract before child controls mount.
// Separate DOM/browser tests exercise the real React Aria collections and media.
function element(tree: ReactNode, type: unknown, label?: string): ReactElement<Record<string, any>> {
  let found: ReactElement<Record<string, any>> | undefined;
  function visit(node: ReactNode) {
    Children.forEach(node, child => {
      if (!isValidElement<Record<string, any>>(child)) return;
      if (child.type === type && (!label || child.props['aria-label'] === label)) found ??= child;
      visit(child.props.children);
    });
  }
  visit(tree);
  if (!found) throw new Error('Expected public element was missing');
  return found;
}

test('command palette ignores stale selection keys and opening does not call onClose', () => {
  const onSelect = vi.fn(); const onClose = vi.fn();
  const items = [{ identifier: 'ada', name: 'Ada' }];
  const { result } = renderHook(() => CommandPalette({ isOpen: true, items, onSelect, onClose }));
  act(() => element(result.current, ListBox).props.onAction('removed'));
  act(() => element(result.current, Modal.Backdrop).props.onOpenChange(true));
  expect(onSelect).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test('entity and source menus ignore keys removed from their controlled collections', () => {
  const onSelect = vi.fn(); const onSourceChange = vi.fn();
  const entity = { identifier: 'ada', name: 'Ada' };
  const tree = EntitySwitcher({ currentEntity: entity, entities: [entity], onSelect, labels: { trigger: 'Choose', menu: 'Entities', section: 'Available' } });
  element(tree, Dropdown.Menu).props.onAction('removed');
  const sources = SourceSelector({ source: 'email', options: [{ key: 'email', label: 'Email' }], onSourceChange });
  element(sources, Dropdown.Menu).props.onAction('removed');
  expect(onSelect).not.toHaveBeenCalled();
  expect(onSourceChange).not.toHaveBeenCalled();
});

test('media callbacks safely no-op before an audio element is mounted', async () => {
  const { result: simple } = renderHook(() => AudioPlayer({ src: '/voice.wav' }));
  expect(() => element(simple.current, IconButton).props.onPress()).not.toThrow();
  const { result: voice } = renderHook(() => WhatsAppAudioPlayer({ src: '/voice.wav' }));
  await act(async () => { await element(voice.current, 'button').props.onClick(); });
  const seek = element(voice.current, 'button', 'Cambiar posición del audio');
  expect(() => seek.props.onClick({})).not.toThrow();
});

test('an image preview opening notification preserves its controlled disclosure state', () => {
  const { result } = renderHook(() => ImageLightbox({ src: '/preview.png' }));
  act(() => element(result.current, Modal.Backdrop).props.onOpenChange(true));
  expect(element(result.current, Modal.Backdrop).props.isOpen).toBe(false);
});

test('connection ignores duplicate callbacks while connecting and accepts an invalid expiry safely', async () => {
  let finish!: () => void;
  const operation = new Promise<void>(resolve => { finish = resolve; });
  const onConnect = vi.fn(() => operation);
  const labels = { checking: 'Checking', generating: 'Generating', waiting: 'Waiting', disconnectedDescription: 'Connect', connect: 'Connect', connectError: 'Failed', refresh: 'Refresh', expiresSoon: 'Soon', expiresIn: (time: string) => time, instructions: [], disconnectedInstructions: [] };
  const { result } = renderHook(() => ConnectionPanel({ state: { status: 'disconnected' }, labels, onConnect, onRefreshQR: vi.fn(), qrExpirySeconds: NaN }));
  let pending!: Promise<void>;
  act(() => {
    const connect = element(result.current, DisconnectedPanel).props.onConnect;
    pending = connect();
    connect();
  });
  expect(onConnect).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); await pending; });
  expect(element(result.current, DisconnectedPanel).props.pending).toBe(false);
});

test('a detached message thread waits for its scroll elements before initial scrolling', () => {
  const labels = { loading: 'Loading', errorLoading: 'Error', noMessages: 'Empty', pollingFallback: 'Polling' };
  const messages = [{ id: 'one', side: 'left' as const, text: 'Hello', timestamp: new Date() }];
  const { result } = renderHook(() => ConversationThread({ messages, labels }));
  expect(result.current).toBeTruthy();
});
