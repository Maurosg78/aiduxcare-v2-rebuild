import { AuditLogEntry as BaseAuditLogEntry } from "@/core/audit/AuditLogger";

/**
 * Tipo para representar una entrada de log de auditoría específica para MCP
 */
export interface AuditLogEntry extends BaseAuditLogEntry {
  block_id: string;
  block_type: "contextual" | "persistent" | "semantic";
  operation: "update";
  old_content: string;
  new_content: string;
}

/**
 * Clase que maneja el registro de auditoría para operaciones de MCP
 */
export class AuditLogger {
  private static auditLogs: AuditLogEntry[] = [];

  /**
   * Registra una operación de actualización de bloques de memoria
   * @param originalBlocks Bloques originales antes de la modificación
   * @param updatedBlocks Bloques después de la modificación
   * @param userId ID del usuario que realiza la operación
   * @param visitId ID de la visita asociada
   */
  public static logBlockUpdates(
    originalBlocks: Record<string, unknown>[],
    updatedBlocks: Record<string, unknown>[],
    userId: string,
    visitId: string
  ): void {
    // Crear un mapa de los bloques originales para facilitar la búsqueda
    const originalBlocksMap = new Map<string, Record<string, unknown>>();
    originalBlocks.forEach(block => {
      const blockId = block.id as string;
      if (blockId) {
        originalBlocksMap.set(blockId, block);
      }
    });

    // Iterar por los bloques actualizados
    updatedBlocks.forEach(updatedBlock => {
      const blockId = updatedBlock.id as string;
      if (!blockId) return; // Ignorar bloques sin ID

      // Buscar el bloque original correspondiente
      const originalBlock = originalBlocksMap.get(blockId);
      if (!originalBlock) return; // Ignorar si no hay original (sería creación, no actualización)

      // Verificar si el contenido ha cambiado
      const originalContent = originalBlock.content as string;
      const updatedContent = updatedBlock.content as string;

      if (originalContent !== updatedContent) {
        // Obtener patient_id del contexto de la visita o de los bloques
        const patientId = this.extractPatientId(updatedBlock, originalBlock) || "";
        
        // Registrar la actualización
        const logEntry: AuditLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          user_id: userId,
          visit_id: visitId,
          action: "block.update",
          patient_id: patientId,
          metadata: {
            block_id: blockId,
            block_type: updatedBlock.type,
            old_content: originalContent,
            new_content: updatedContent
          },
          block_id: blockId,
          block_type: updatedBlock.type as "contextual" | "persistent" | "semantic",
          operation: "update",
          old_content: originalContent,
          new_content: updatedContent
        };

        this.auditLogs.push(logEntry);
      }
    });
  }

  /**
   * Extrae el patient_id de los bloques de memoria
   * @param updatedBlock Bloque actualizado
   * @param originalBlock Bloque original
   * @returns patient_id si está disponible
   */
  private static extractPatientId(
    updatedBlock: Record<string, unknown>,
    originalBlock: Record<string, unknown>
  ): string | undefined {
    // Intentar obtener patient_id del bloque actualizado primero
    if (updatedBlock.patient_id) {
      return updatedBlock.patient_id as string;
    }
    
    // Si no está en el actualizado, intentar del original
    if (originalBlock.patient_id) {
      return originalBlock.patient_id as string;
    }
    
    // Si no está disponible, devolver undefined
    return undefined;
  }

  /**
   * Obtiene todos los logs de auditoría registrados (para desarrollo/testing)
   * @returns Array de logs de auditoría
   */
  public static getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Limpia todos los logs de auditoría (principalmente para testing)
   */
  public static clearAuditLogs(): void {
    this.auditLogs = [];
  }
} 