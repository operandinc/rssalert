import Link from "next/link";
import { useRouter } from "next/router";

interface BannerProps {
  hideManageButton?: boolean;
}

export default function Banner({ hideManageButton }: BannerProps) {
  const router = useRouter();
  return (
    <header className="container mx-auto items-center justify-between space-y-2 px-3 pt-4 pb-4 md:flex md:px-6 md:pb-2 md:pt-8">
      <div>
        <h1 className="text-xl font-semibold lg:text-2xl">
          <span className="block font-brand leading-none tracking-tighter text-[#8100B4]">
            <span
              className="text-[#8100B4] cursor-pointer"
              onClick={() => router.push("/")}
            >
              RSS Alerts
            </span>
          </span>
          by{" "}
          <Link href="https://operand.ai">
            <a className="underline cursor-pointer">Operand</a>
          </Link>
        </h1>
      </div>
      {!hideManageButton && (
        <div className="h-full flex flex-col items-center justify-center">
          <Link href="/login">
            <a className="text-sm text-center bg-transparent border-solid border-2 rounded-md py-2 px-4 hover:shadow-md">
              Manage my alerts
            </a>
          </Link>
        </div>
      )}
    </header>
  );
}
