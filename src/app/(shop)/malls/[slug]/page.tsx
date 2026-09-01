import { Suspense } from "react";
import MallStoresPage from "./mall-stores-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MallStoresRoute(props: PageProps) {
  const params = await props.params;
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
