import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/dynamo";

// Revalidar cada 60 segundos (ISR) o usar "force-dynamic" para tiempo real total
export const revalidate = 0; 

export default async function Home() {
  const data = await getDashboardData();
  
  return (
    <main>
      <Dashboard data={data} />
    </main>
  );
}
