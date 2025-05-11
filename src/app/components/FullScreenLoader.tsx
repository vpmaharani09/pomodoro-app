const FullScreenLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-white font-semibold text-lg">Loading...</span>
    </div>
  </div>
);

export default FullScreenLoader;
