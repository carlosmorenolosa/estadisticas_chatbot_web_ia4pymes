import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Evitar errores de compilación si no hay credenciales en local
// En Vercel, estas variables estarán inyectadas de forma segura.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE || "chatbot_analytics_web_ia4pymes";

export type Turn = {
  session_id: string;
  timestamp: string;
  turn_id: string;
  date: string;
  user_message: string;
  bot_response: string;
  response_time_ms: number;
};

export type Session = {
  id: string;
  date: string;
  lastMessage: string;
  turns: Turn[];
  totalTimeMs: number;
};

/**
 * Obtiene todos los datos crudos escaneando la tabla.
 * (Para producción a gran escala se usaría Query con GSI, pero Scan es
 * suficiente para un dashboard inicial de volumen medio).
 */
export async function getDashboardData() {
  if (process.env.AWS_ACCESS_KEY_ID === "dummy" || !process.env.AWS_ACCESS_KEY_ID) {
    console.warn("No se encontraron credenciales de AWS. Retornando datos vacíos.");
    return {
      kpis: { totalSessions: 0, totalMessages: 0, avgResponseTime: 0 },
      dailyStats: [],
      sessions: []
    };
  }

  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    const items = (response.Items || []) as Turn[];

    // --- Procesamiento de datos en memoria ---

    let totalResponseTime = 0;
    const sessionMap = new Map<string, Session>();
    const dailyMap = new Map<string, number>();

    items.forEach((item) => {
      // Calcular tiempo total
      if (item.response_time_ms) {
        totalResponseTime += item.response_time_ms;
      }

      // Agrupar por día para la gráfica
      const day = item.date || item.timestamp.substring(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);

      // Agrupar por sesión
      if (!sessionMap.has(item.session_id)) {
        sessionMap.set(item.session_id, {
          id: item.session_id,
          date: day,
          lastMessage: item.user_message,
          turns: [],
          totalTimeMs: 0
        });
      }
      
      const session = sessionMap.get(item.session_id)!;
      session.turns.push(item);
      session.totalTimeMs += (item.response_time_ms || 0);
      
      // Mantener como lastMessage el más reciente
      if (item.timestamp > session.turns[session.turns.length - 1]?.timestamp) {
          session.lastMessage = item.user_message;
      }
    });

    // Ordenar turnos dentro de cada sesión
    sessionMap.forEach(session => {
      session.turns.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      if (session.turns.length > 0) {
        session.lastMessage = session.turns[session.turns.length - 1].user_message;
      }
    });

    // Formatear sesiones como array y ordenar por fecha descendente
    const sessions = Array.from(sessionMap.values()).sort((a, b) => {
        const aDate = a.turns[0]?.timestamp || a.date;
        const bDate = b.turns[0]?.timestamp || b.date;
        return bDate.localeCompare(aDate);
    });

    // Formatear daily stats para recharts y ordenar por fecha
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, interacciones: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalMessages = items.length;
    const totalSessions = sessions.length;
    const avgResponseTime = totalMessages > 0 ? Math.round(totalResponseTime / totalMessages) : 0;

    return {
      kpis: {
        totalSessions,
        totalMessages,
        avgResponseTime
      },
      dailyStats,
      sessions
    };

  } catch (error) {
    console.error("Error al obtener datos de DynamoDB:", error);
    // Retornamos un estado vacío pero válido para no romper la UI
    return {
      kpis: { totalSessions: 0, totalMessages: 0, avgResponseTime: 0 },
      dailyStats: [],
      sessions: []
    };
  }
}
