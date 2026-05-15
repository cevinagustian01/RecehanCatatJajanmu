import prisma from "@/lib/prisma";
import { ContentEditor } from "./ContentEditor";

export default async function ContentPage() {
  const contents = await prisma.landingPageContent.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Landing Page Content</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola konten halaman utama Domptt</p>
      </div>

      <ContentEditor initialContents={contents} />
    </div>
  );
}
