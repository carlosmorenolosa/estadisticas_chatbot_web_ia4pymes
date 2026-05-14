import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/dynamo";

export const revalidate = 0;

export default async function Home() {
  let data;
  let error: string | null = null;
  
  try {
    data = await getDashboardData();
  } catch (e) {
    console.error("Error cargando dashboard:", e);
    error = "Error al cargar los datos del dashboard";
    data = {
      kpis: { totalSessions: 0, totalMessages: 0, avgResponseTime: 0 },
      dailyStats: [],
      sessions: []
    };
  }
  
  return (
    <main>
      <Dashboard data={data} />
    </main>
  );
}
