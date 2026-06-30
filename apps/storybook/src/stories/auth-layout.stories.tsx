import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, Mic, FileText, Shield, Lock } from "lucide-react";
import { AuthLayout } from "@lindaui/blocks/auth-layout";
import { LoginForm } from "@lindaui/blocks/login-form";

const meta: Meta<typeof AuthLayout> = {
  title: "Blocks/AuthLayout",
  component: AuthLayout,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AuthLayout>;

// Logo del panel de marca (desktop, sobre fondo viewer oscuro).
const BrandLogo = (
  <>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-viewer-foreground/12">
      <Activity className="h-6 w-6" strokeWidth={2.4} />
    </div>
    <div className="leading-none">
      <span className="text-xl font-semibold tracking-tight">Think</span>
      <span className="text-xl font-semibold tracking-tight opacity-70">Informes</span>
    </div>
  </>
);

// Logo compacto del panel de form (mobile, sobre fondo claro → primary).
const CompactLogo = (
  <>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <Activity className="h-6 w-6" strokeWidth={2.4} />
    </div>
    <div className="leading-none">
      <span className="text-xl font-semibold tracking-tight">Think</span>
      <span className="text-xl font-semibold tracking-tight text-primary">Informes</span>
    </div>
  </>
);

// Réplica del split-screen de login del poc: panel de marca + form.
export const SplitScreen: Story = {
  render: () => (
    <AuthLayout
      logo={BrandLogo}
      compactLogo={CompactLogo}
      brandHeadline="Del dictado al informe firmado, sin fricción."
      brandDescription="Dictá por voz frente a la imagen, revisá el borrador transcripto, corregí hablando y firmá. ThinkInformes lo transcribe y estructura por vos."
      brandFeatures={[
        { icon: <Mic className="h-4 w-4" />, label: "Dictado por voz" },
        { icon: <FileText className="h-4 w-4" />, label: "Borrador automático" },
        { icon: <Shield className="h-4 w-4" />, label: "Firma trazable" },
      ]}
      brandFooter="PoC · entorno de demostración"
      title="Iniciar sesión"
      description="Accedé con tu usuario institucional."
      footer={
        <>
          <Lock className="h-3 w-3" />
          Sesión protegida con cookie httpOnly
        </>
      }
    >
      <LoginForm bare onSubmit={(v) => alert(JSON.stringify(v))} submitLabel="Ingresar" />
    </AuthLayout>
  ),
};

// Sin panel de marca: form centrado a una sola columna.
export const FormOnly: Story = {
  render: () => (
    <AuthLayout
      compactLogo={CompactLogo}
      title="Iniciar sesión"
      description="Accedé con tu usuario institucional."
      footer={
        <>
          <Lock className="h-3 w-3" />
          Sesión protegida
        </>
      }
    >
      <LoginForm bare onSubmit={(v) => alert(JSON.stringify(v))} submitLabel="Ingresar" />
    </AuthLayout>
  ),
};
