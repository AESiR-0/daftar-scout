// app/account-deactivated/page.tsx

export default function AccountDeactivatedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] text-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-destructive">Your account has been deactivated</h1>
      <p className="mb-6 text-muted-foreground max-w-xl">
        Your account has been deleted or archived. If you believe this is a mistake or want to reactivate your account, please contact us at
        <a href="mailto:support@daftaros.com" className="text-blue-500 underline ml-1">support@daftaros.com</a>.
      </p>
      <a
        href="mailto:support@daftaros.com?subject=Reactivate%20my%20DaftarOS%20account"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-[0.35rem] font-medium"
      >
        Email Support to Reactivate
      </a>
    </div>
  );
} 