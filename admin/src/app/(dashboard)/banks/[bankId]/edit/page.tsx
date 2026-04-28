import { BankForm } from "@/components/banks/bank-form";

export default async function EditBankPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">编辑题库</h1>
      <BankForm bankId={bankId} />
    </div>
  );
}
