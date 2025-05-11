import Image from "next/image";
import { useRouter } from "next/navigation";

const Welcome = () => {
  const router = useRouter();
  return (
    <div className="w-[100vw] max-w-[430px] h-screen mx-auto bg-[#232336] flex flex-col items-center justify-between p-0 sm:rounded-none sm:w-full">
      <div className="flex flex-col items-center w-full mt-16 px-6">
        <h1 className="text-white text-2xl font-bold text-center mb-3 leading-snug">
          Stay Focused, Work Smarter!
        </h1>
        <p className="text-[#E3E3E3] text-base text-center mb-8">
          Boost productivity with the Pomodoro technique
        </p>
        <div className="w-full flex justify-center mb-8">
          <Image
            src="/welcome_illustration_img.svg"
            alt="Welcome Illustration"
            width={260}
            height={160}
            priority
          />
        </div>
      </div>
      <div className="w-full flex flex-col items-center mb-10 px-6">
        <button
          className="w-full max-w-[340px] bg-[#7B61FF] text-white text-lg font-semibold rounded-full py-4 flex items-center justify-center gap-2 shadow-md"
          onClick={() => router.push("/signin")}
        >
          Continue
          <span className="ml-2 text-xl">&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
