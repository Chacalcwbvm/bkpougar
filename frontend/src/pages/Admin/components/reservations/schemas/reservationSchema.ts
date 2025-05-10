
import * as z from "zod";

// Define form schema
export const formSchema = z.object({
  hospede_nome: z.string().min(3, { message: "Nome é obrigatório e deve ter pelo menos 3 caracteres" }),
  hospede_email: z.string().email({ message: "Email inválido" }),
  hospede_telefone: z.string().min(8, { message: "Telefone é obrigatório" }),
  hospede_cep: z.string().optional(),
  hospede_endereco: z.string().optional(),
  hospede_bairro: z.string().optional(),
  hospede_cidade: z.string().optional(),
  hospede_estado: z.string().optional(),
  quarto_id: z.string().min(1, { message: "Quarto é obrigatório" }),
  data_checkin: z.date({ required_error: "Data de check-in é obrigatória" }),
  data_checkout: z.date({ required_error: "Data de check-out é obrigatória" }),
  num_hospedes: z.string().min(1, { message: "Número de hóspedes é obrigatório" }),
  observacoes: z.string().optional(),
  status: z.string().default("pendente")
});

export type FormValues = z.infer<typeof formSchema>;
