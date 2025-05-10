
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require '../conexao.php';

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Pegar o idioma da requisição (padrão: en)
$lang = isset($dados['lang']) ? $dados['lang'] : 'en';

// Verificar se ID da reserva foi fornecido
if (!isset($dados['id_reserva'])) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'ID da reserva não fornecido' : 'Reservation ID not provided';
    echo json_encode(['erro' => $erro]);
    exit;
}

$id_reserva = intval($dados['id_reserva']);

// Buscar os dados da reserva
$sql = "SELECT r.*, q.nome as quarto_nome, h.nome as hospede_nome, h.email as hospede_email, h.telefone as hospede_telefone
        FROM reservas r
        LEFT JOIN quartos q ON r.id_quarto = q.id
        LEFT JOIN hospedes h ON r.id_hospede = h.id
        WHERE r.id = $id_reserva";

$resultado = $conexao->query($sql);

if ($resultado->num_rows === 0) {
    http_response_code(404);
    $erro = $lang == 'pt' ? 'Reserva não encontrada' : 'Reservation not found';
    echo json_encode(['erro' => $erro]);
    exit;
}

$reserva = $resultado->fetch_assoc();

// Verificar se a reserva tem um telefone válido
if (empty($reserva['hospede_telefone'])) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'Hóspede não possui telefone cadastrado' : 'Guest does not have a registered phone';
    echo json_encode(['erro' => $erro]);
    exit;
}

// Formatando as datas
$data_checkin_formatada = date('d/m/Y', strtotime($reserva['data_checkin']));
$data_checkout_formatada = date('d/m/Y', strtotime($reserva['data_checkout']));

// Template da mensagem
if ($lang == 'pt') {
    $mensagem_whatsapp = "Olá {$reserva['hospede_nome']}, sua reserva na PousadaViva foi confirmada!\n\n";
    $mensagem_whatsapp .= "📆 Check-in: $data_checkin_formatada\n";
    $mensagem_whatsapp .= "📆 Check-out: $data_checkout_formatada\n";
    $mensagem_whatsapp .= "🏨 Quarto: {$reserva['quarto_nome']}\n";
    $mensagem_whatsapp .= "👥 Hóspedes: {$reserva['numero_hospedes']}\n";
    $mensagem_whatsapp .= "💰 Valor Total: R$ {$reserva['valor_total']}\n\n";
    $mensagem_whatsapp .= "🔑 Código de Reserva: {$reserva['codigo']}\n\n";
    $mensagem_whatsapp .= "Estamos ansiosos para recebê-lo!";
} else {
    $mensagem_whatsapp = "Hello {$reserva['hospede_nome']}, your reservation at PousadaViva has been confirmed!\n\n";
    $mensagem_whatsapp .= "📆 Check-in: $data_checkin_formatada\n";
    $mensagem_whatsapp .= "📆 Check-out: $data_checkout_formatada\n";
    $mensagem_whatsapp .= "🏨 Room: {$reserva['quarto_nome']}\n";
    $mensagem_whatsapp .= "👥 Guests: {$reserva['numero_hospedes']}\n";
    $mensagem_whatsapp .= "💰 Total Amount: $ {$reserva['valor_total']}\n\n";
    $mensagem_whatsapp .= "🔑 Reservation Code: {$reserva['codigo']}\n\n";
    $mensagem_whatsapp .= "We look forward to welcoming you!";
}

// Dados para a API de WhatsApp
$whatsapp_data = [
    'telefone' => $reserva['hospede_telefone'],
    'mensagem' => $mensagem_whatsapp,
    'id_reserva' => $id_reserva,
    'lang' => $lang
];

// URL do script de envio de WhatsApp
$whatsapp_script_url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/../enviar_whatsapp.php';

// Realizar solicitação para o envio de WhatsApp
$ch = curl_init($whatsapp_script_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($whatsapp_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$whatsapp_response = curl_exec($ch);
$curl_error = curl_error($ch);
curl_close($ch);

// Verificar se ocorreu algum erro com o cURL
if ($curl_error) {
    http_response_code(500);
    echo json_encode(['erro' => $curl_error]);
    exit;
}

// Decodificar a resposta do WhatsApp
$whatsapp_result = json_decode($whatsapp_response, true);

// Verificar se houve erro no envio
if (!$whatsapp_result || isset($whatsapp_result['erro'])) {
    http_response_code(500);
    $erro = $lang == 'pt' ? 'Erro ao enviar mensagem WhatsApp' : 'Error sending WhatsApp message';
    echo json_encode(['erro' => $erro, 'detalhes' => $whatsapp_result['erro'] ?? 'Resposta inválida']);
    exit;
}

// Responder com sucesso
$mensagem_sucesso = $lang == 'pt' ? 'Confirmação de reserva enviada por WhatsApp com sucesso' : 'Reservation confirmation sent by WhatsApp successfully';
echo json_encode([
    'sucesso' => true,
    'mensagem' => $mensagem_sucesso,
    'whatsapp_url' => $whatsapp_result['url'] ?? null
]);

$conexao->close();
?>
