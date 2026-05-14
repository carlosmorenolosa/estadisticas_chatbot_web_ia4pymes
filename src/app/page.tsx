import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/dynamo";

export const revalidate = 0;

export default async function Home() {
  const data = await getDashboardData();
  
  return (
    <main>
      <Dashboard data={data} />
    </main>
  );
}
