import { createClient } from '@supabase/supabase-js'

// Cliente Supabase con service_role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" })

  const { address, toolId, status, send, receive} = req.body

  // Validar dirección del creador de la app
  if (address.toLowerCase() !== process.env.NEXT_PUBLIC_APP_CREATOR_ADDRESS.toLowerCase()) {
    return res.status(403).json({ error: "Unauthorized sender" })
  }

  // Verificar si la herramienta ya existe
  const { data: existing, error: findError } = await supabase
    .from("inspects")
    .select("*")
    .eq("id", toolId)
    .single()

  if (findError && findError.code !== "PGRST116") {
    // Error distinto de "no encontrado"
    return res.status(500).json({ error: findError.message })
  }

  let result
  if (existing) {
    const updateFields = {}
    if (send !== null && send !== undefined) updateFields.conditionSended = send
    if (receive !== null && receive !== undefined) updateFields.conditionReceive = receive

    result = await supabase
      .from("inspects")
      .update(updateFields)
      .eq("id", toolId)
  } else {
    let id = toolId
    result = await supabase
      .from("inspects")
      .insert([{
        id,
        status,
        conditionSended: send,
        conditionReceive: receive
      }])
  }

  if (result.error) return res.status(400).json({ error: result.error.message })

  res.status(200).json({ data: result.data })
}
