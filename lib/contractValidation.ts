import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export const validateContractForSignature = async (
  contractId: string,
): Promise<{
  canSign: boolean
  error?: string
}> => {
  try {
    if (!isSupabaseConfigured()) return { canSign: false, error: "Database not configured" }
    const supabase = await supabaseServer()
    if (!supabase) return { canSign: false, error: "Database not configured" }

    const { data, error } = await supabase
      .from('contract_instances')
      .select('id, signature_status, contract_content, event_id, dj_id, producer_id')
      .eq('id', contractId)
      .limit(1)

    if (error) throw error

    const contract = Array.isArray(data) ? data[0] : data

    if (!contract) {
      return { canSign: false, error: "Contrato não encontrado." }
    }

    if (contract.signature_status === "signed") {
      return { canSign: false, error: "Contrato já foi assinado." }
    }

    if (!contract.contract_content || contract.contract_content.trim() === "") {
      return {
        canSign: false,
        error: "Contrato não disponível para assinatura no momento. Aguarde a geração e tente novamente.",
      }
    }

    return { canSign: true }
  } catch (error) {
    console.error("Erro ao validar contrato:", error)
    return { canSign: false, error: "Erro interno ao validar contrato." }
  }
}
