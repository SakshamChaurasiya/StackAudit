export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Audit Results</h1>
      <p className="mt-2 text-muted-foreground">
        Results for audit <span className="font-mono text-foreground">{id}</span>{" "}
        — implemented in Phase 3.
      </p>
    </main>
  );
}
