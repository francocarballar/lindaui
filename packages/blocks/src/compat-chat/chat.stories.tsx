import { useState } from "react";
import { ChatAvatar, ChatHeader, ChatLayout, ConversationList, ConversationThread, EmptyChatView, MessageBubble, MessageComposer, type ConversationSummary, type GenericMessage } from "../chat";
import { Badge } from "@lindaui/ui/compat";
import { StatusFilters } from "../status-filters";

const meta = { title: "Blocks/Compatibility/Chat", component: ChatLayout, parameters: { layout: "fullscreen" }, tags: ["autodocs"] };
export default meta;

const initialMessages: GenericMessage[] = [
  { id: "one", side: "center", text: "Conversation started", timestamp: new Date() },
  { id: "two", side: "left", text: "Hi! Could you send the schedule?", timestamp: new Date() },
  { id: "three", side: "right", text: "Of course. Here it is.", timestamp: new Date(), authorTag: "IA", media: { kind: "pdf", url: "data:application/pdf,Example%20schedule", label: "Schedule.pdf" } },
];
const periods = { Hoy: "Today", Ayer: "Yesterday", "Esta semana": "This week", "Este mes": "This month", "Más antiguos": "Older" };

function ControlledChatDemo() {
  const [selectedId, setSelectedId] = useState<string | undefined>("alex");
  const [search, setSearch] = useState("");
  const [value, setValue] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [messages, setMessages] = useState(initialMessages);
  const conversations: (ConversationSummary & { status: string })[] = [
    { id: "alex", status: "active", title: "Alex Rivera", preview: "Of course. Here it is.", timestamp: new Date(), badge: <Badge color="success">Active</Badge>, unreadCount: 2 },
    { id: "sam", status: "pending", title: "Sam Chen", preview: "Thank you!", timestamp: new Date(Date.now() - 86_400_000), badge: <Badge color="warning">Pending</Badge> },
  ];
  const selected = conversations.find((item) => item.id === selectedId);
  const items = conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()) && (statuses.length === 0 || statuses.includes(item.status))).map((item) => ({ ...item, isSelected: selectedId === item.id }));
  function send() {
    setMessages((current) => [...current, { id: String(Date.now()), side: "right", text: value.trim(), timestamp: new Date(), authorTag: "manual" }]);
    setValue("");
  }
  return <div className="h-[720px] border border-border">
    <ChatLayout selectedChatId={selectedId} sidebar={<ConversationList items={items} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search conversations" onItemSelect={setSelectedId} renderAvatar={(item) => <ChatAvatar name={item.title} />} labels={{ loading: "Loading", emptyPreview: "No messages", periods }} emptyMessage="No conversations" filters={<StatusFilters availableStatuses={["active", "pending"]} labels={{ active: "Active", pending: "Pending" }} colors={{ active: "success", pending: "warning" }} counts={{ active: 1, pending: 1 }} selectedStatuses={statuses} onStatusToggle={(status) => setStatuses((current) => current.includes(status) ? current.filter((s) => s !== status) : [...current, status])} />} />} main={selected ? <div className="relative flex h-full flex-col">
      <ChatHeader title={selected.title} subtitle="Available" avatar={<ChatAvatar name={selected.title} />} actions={<button type="button" onClick={() => setSelectedId(undefined)}>Back</button>} />
      <div className="relative min-h-0 flex-1"><ConversationThread messages={messages} backgroundImage={null} labels={{ loading: "Loading messages", errorLoading: "Could not load messages", noMessages: "No messages" }} /><MessageComposer value={value} onValueChange={setValue} onSend={send} placeholder="Write a message" /></div>
    </div> : <EmptyChatView title="Select a conversation" description="Messages appear here." />} detail={selected && <div className="space-y-3 p-4"><h3 className="font-semibold">Contact details</h3><p>{selected.title}</p><Badge color="success">Active</Badge></div>} />
  </div>;
}

export const ControlledWorkspace = { render: () => <ControlledChatDemo /> };
export const EmptySelection = { args: { sidebar: <div className="p-4">No conversations</div>, main: <EmptyChatView title="Select a conversation" description="Messages appear here." /> }, render: (args: React.ComponentProps<typeof ChatLayout>) => <div className="h-[600px]"><ChatLayout {...args} /></div> };
export const LoadingAndPolling = { render: () => <div className="h-[400px]"><ConversationThread messages={[]} isLoading showPollingFallback backgroundImage={null} labels={{ loading: "Loading messages", errorLoading: "Could not load messages", noMessages: "No messages", pollingFallback: "Reconnecting — using polling" }} /></div> };
export const MediaAttachments = { render: () => <div className="max-w-3xl space-y-4 bg-background p-6">
  <MessageBubble message={{ id: "image", side: "left", text: "Shared image", timestamp: new Date(), media: { kind: "image", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%2300a884'/%3E%3Ctext x='400' y='300' text-anchor='middle' fill='white' font-size='48'%3EShared image%3C/text%3E%3C/svg%3E" } }} />
  <MessageBubble message={{ id: "audio", side: "left", text: "Voice note", timestamp: new Date(), media: { kind: "audio", url: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg" } }} />
  <MessageBubble message={initialMessages[2]!} />
</div> };
