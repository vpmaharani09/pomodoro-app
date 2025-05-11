const Toast = ({ message, show }: { message: string; show: boolean }) => {
  if (!show) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 bg-[#7B61FF] text-white px-6 py-3 rounded-2xl shadow-lg font-semibold text-base z-50 animate-fade-in">
      {message}
    </div>
  );
};

export default Toast;
