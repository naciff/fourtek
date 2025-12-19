"use client";
export default function DeleteAccountForm() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Deseja excluir sua conta e todos os dados?")) {
      e.preventDefault();
    }
  }
  return (
    <form action="/auth/delete" method="post" onSubmit={onSubmit}>
      <button className="rounded bg-red-600 px-4 py-2 text-white">Excluir conta</button>
    </form>
  );
}
