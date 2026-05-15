export function PageLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.25)",
          borderTopColor: "rgba(255,255,255,0.9)",
          animation: "sb-spin 0.75s linear infinite",
        }}
      />
    </div>
  );
}
