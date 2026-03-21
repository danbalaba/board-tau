import LoadingAnimation from "@/components/common/LoadingAnimation";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <LoadingAnimation text="Loading Favorites..." size="large" />
    </div>
  );
};

export default Loading;
