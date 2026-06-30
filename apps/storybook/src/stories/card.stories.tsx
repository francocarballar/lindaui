import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@lindaui/ui/card";
import { Button } from "@lindaui/ui/button";
import { Input } from "@lindaui/ui/input";
import { Link } from "@lindaui/ui/link";
import { CloseButton } from "@lindaui/ui/close-button";
import { CircleDollarSign, ArrowUpRight } from "lucide-react";

// Réplica de las stories de HeroUI v3 (packages/react/src/components/card),
// adaptadas a la API de @lindaui/ui: Card.Header→CardHeader, Icon(@iconify)→lucide,
// Avatar.Image/Fallback→<img>, Form/TextField/Label/Input→@lindaui/ui/input,
// Link.Icon→lucide, variant="tertiary"→className.
const meta: Meta<typeof Card> = {
  title: "Surfaces/Card",
  component: Card,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["transparent", "default", "secondary", "tertiary"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[400px]" {...args}>
      <CircleDollarSign aria-label="Dollar sign icon" className="text-primary size-6" />
      <CardHeader>
        <CardTitle>Become an Acme Creator!</CardTitle>
        <CardDescription>
          Visit the Acme Creator Hub to sign up today and start earning credits from your
          fans and followers.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="https://heroui.com" target="_blank" rel="noopener noreferrer">
          Creator Hub
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {([
        ["transparent", "Minimal prominence with transparent background", "Use for less important content or nested cards"],
        ["default", "Standard card appearance (bg-surface)", "The default card variant for most use cases"],
        ["secondary", "Medium prominence (bg-surface-secondary)", "Use to draw moderate attention"],
        ["tertiary", "Higher prominence (bg-surface-tertiary)", "Use for primary or featured content"],
      ] as const).map(([v, desc, body]) => (
        <Card key={v} className="w-[320px]" variant={v}>
          <CardHeader>
            <CardTitle className="capitalize">{v}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <Card className="w-[520px] items-stretch md:flex-row" {...args}>
      <img
        alt="Porsche 911 Golden Edition"
        className="pointer-events-none aspect-square w-full rounded-3xl object-cover select-none md:max-w-[136px]"
        loading="lazy"
        src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/components/card/porsche-911.png"
      />
      <div className="flex flex-1 flex-col gap-3">
        <CardHeader className="gap-1">
          <CardTitle>Get the new Porsche 911 golden edition</CardTitle>
          <CardDescription>
            Experience unmatched luxury and performance with the Porsche 911 Golden
            Edition—where sleek design meets cutting-edge tech and pure driving thrill.
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto flex w-full flex-row items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">$36,799</span>
            <span className="text-xs text-muted">11 available</span>
          </div>
          <Button>Buy Now</Button>
        </CardFooter>
      </div>
    </Card>
  ),
};

export const WithAvatar: Story = {
  render: (args) => (
    <div className="flex gap-4">
      {([
        ["Indie Hackers", "148 members", "IH", "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"],
        ["AI Builders", "362 members", "AB", "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo2.jpg"],
      ] as const).map(([title, members, by, src]) => (
        <Card key={title} className="w-[200px] gap-2" {...args}>
          <img
            alt={title}
            className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
            loading="lazy"
            src={src}
          />
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{members}</CardDescription>
          </CardHeader>
          <CardFooter className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-semibold">
              {by}
            </span>
            <span className="text-xs">By {title.split(" ")[0]}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
};

export const WithForm: Story = {
  render: (args) => (
    <Card className="w-full max-w-md" {...args}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="email@example.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col gap-2">
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <Link className="text-center text-sm" href="#">
            Forgot password?
          </Link>
        </CardFooter>
      </form>
    </Card>
  ),
};

export const WithImages: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="flex w-full items-center justify-center p-4">
      <div className="grid w-full max-w-2xl grid-cols-12 gap-4">
        {/* Banner */}
        <Card className="relative col-span-12 flex flex-col sm:flex-row" {...args}>
          <div className="h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
            <img
              alt="Cherries"
              className="h-full w-full scale-125 object-cover select-none"
              loading="lazy"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/cherries.jpeg"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <CardHeader className="gap-1">
              <CardTitle className="pr-8">Become an ACME Creator!</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor.
              </CardDescription>
              <CloseButton aria-label="Close banner" className="absolute top-3 right-3" />
            </CardHeader>
            <CardFooter className="mt-auto flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Only 10 spots</span>
                <span className="text-xs text-muted">Submission ends Oct 10.</span>
              </div>
              <Button className="w-full sm:w-auto">Apply Now</Button>
            </CardFooter>
          </div>
        </Card>

        {/* Notification card */}
        <Card className="relative col-span-12 sm:col-span-6">
          <CloseButton aria-label="Close notification" className="absolute top-3 right-3 z-10" />
          <CardHeader className="gap-3">
            <CircleDollarSign aria-label="Payment" className="text-primary size-8 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted uppercase">PAYMENT</span>
              <CardTitle className="pr-8 text-base">You can now withdraw on crypto</CardTitle>
              <CardDescription className="text-sm">
                Add your wallet in settings to withdraw
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Link href="#">
              Go to settings
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Image card with overlay footer */}
        <Card className="relative col-span-12 min-h-[200px] overflow-hidden rounded-3xl sm:col-span-6">
          <img
            alt="NEO Home Robot"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo2.jpeg"
          />
          <CardFooter className="z-10 mt-auto flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-black">Available soon</div>
              <div className="text-xs text-black/60">Get notified</div>
            </div>
            <Button size="sm" className="bg-white text-black">
              Notify me
            </Button>
          </CardFooter>
        </Card>

        {/* Transparent list cards */}
        <div className="col-span-12 flex flex-col gap-2">
          {([
            ["Bridging the Future", "Today, 6:30 PM", "robot1.jpeg"],
            ["Avocado Hackathon", "Wed, 4:30 PM", "avocado.jpeg"],
            ["Sound Electro | Beyond art", "Fri, 8:00 PM", "oranges.jpeg"],
          ] as const).map(([title, when, img]) => (
            <Card key={title} className="flex flex-row gap-3 p-1" variant="transparent">
              <img
                alt={title}
                className="aspect-square h-16 w-16 shrink-0 rounded-xl object-cover select-none"
                loading="lazy"
                src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/${img}`}
              />
              <div className="flex flex-1 flex-col justify-center gap-1">
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription className="text-xs">{when}</CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  ),
};
