import { Suspense } from "react";
import MallStoresPage from "./mall-stores-content";

interface PageProps {
  params: { slug: string };
}

export default function MallStoresRoute({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-[#EADBF8] min-h-screen flex items-center justify-center">
          <p className="text-[#6D349F] font-bold font-montserrat">Loading stores...</p>
        </div>
      }
    >
      <MallStoresPage params={params} />
    </Suspense>
  );
}
