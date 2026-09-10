export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-danger" role="alert">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white active:bg-blue-800"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
