<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'conexao.php';

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verificar se todos os campos necessários foram fornecidos
if (!isset($dados['telefone']) || !isset($dados['mensagem'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos']);
    exit;
}

// Obter o idioma da requisição (padrão: en)
$lang = isset($dados['lang']) ? $dados['lang'] : 'en';

// Configuração da API WhatsApp (usando API genérica para exemplificação)
$whatsapp_api_key = "YOUR_WHATSAPP_API_KEY"; // Na implementação real, isso deve ser armazenado de forma segura
$whatsapp_api_url = "https://api.whatsapp.com/send";

// Limpar o número de telefone (remover caracteres não numéricos)
$telefone = preg_replace("/[^0-9]/", "", $dados['telefone']);

// Preparar a mensagem
$mensagem = urlencode($dados['mensagem']);

// No ambiente real, você usaria uma API oficial do WhatsApp Business
// Este código simula o envio criando uma URL para abrir o WhatsApp Web
$whatsapp_url = "$whatsapp_api_url?phone=$telefone&text=$mensagem";

// Registrar o envio no banco de dados
$id_reserva = isset($dados['id_reserva']) ? intval($dados['id_reserva']) : 0;
$status = 'enviado';

if ($id_reserva > 0) {
    $sql = "INSERT INTO mensagens_enviadas (id_reserva, tipo, destinatario, conteudo, status, data_envio) 
            VALUES ($id_reserva, 'whatsapp', '$telefone', '" . $conexao->real_escape_string($dados['mensagem']) . "', '$status', NOW())";
    $conexao->query($sql);
}

// Responder com sucesso
echo json_encode([
    'sucesso' => true,
    'mensagem' => $lang == 'pt' ? 'Mensagem enviada com sucesso' : 'Message sent successfully',
    'url' => $whatsapp_url
]);

$conexao->close();
?>
