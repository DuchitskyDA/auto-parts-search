export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2 m-0" role="alert">
      <span>{message}</span>
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
        Повторить
      </button>
    </div>
  );
}
