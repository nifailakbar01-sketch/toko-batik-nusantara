export default function Flash({ type = 'success', message }) {
  if (!message) return null;
  return <div className={`flash flash-${type}`}>{message}</div>;
}
