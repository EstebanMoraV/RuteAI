import { SuperAdminSidebar } from "./components/SuperAdminSidebar";
import { SuperAdminHeader } from "./components/SuperAdminHeader";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import prisma from "@ruteai/database";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuarioDB = await prisma.usuario.findUnique({ where: { id: user.id } });
  if (usuarioDB?.rol !== "super_admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100">
      <SuperAdminSidebar nombre={usuarioDB.nombre} email={usuarioDB.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <SuperAdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
