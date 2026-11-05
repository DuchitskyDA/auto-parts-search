export default function Loader({ text }) {
  return (
    <div className="state d-flex align-items-center justify-content-center gap-2" role="status">
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
