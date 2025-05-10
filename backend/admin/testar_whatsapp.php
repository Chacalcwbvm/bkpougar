
<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Lidar com solicitações OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

// Obter configurações do WhatsApp
$sql = "SELECT whatsapp_api_key, whatsapp_business_phone, whatsapp_business_id FROM configuracoes LIMIT 1";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $config = $resultado->fetch_assoc();
    $apiKey = $config['whatsapp_api_key'];
    $businessPhone = $config['whatsapp_business_phone'];
    $businessId = $config['whatsapp_business_id'];
    
    // Verificar se as configurações estão preenchidas
    if (empty($apiKey) || empty($businessPhone) || empty($businessId)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Configurações de WhatsApp incompletas']);
        exit;
    }
    
    // Obter dados da requisição
    $dados = json_decode(file_get_contents('php://input'), true);
    $telefoneDestino = $dados['telefone'] ?? null;
    
    if (empty($telefoneDestino)) {
        $telefoneDestino = $businessPhone; // Se não for fornecido um número, usa o número do negócio
    }
    
    // Em um ambiente real, aqui seria feita a chamada à API do WhatsApp
    // Simulação de envio (em produção, substitua por uma chamada real à API)
    $mensagem = "Este é um teste de mensagem do sistema PousadaViva. Timestamp: " . date('Y-m-d H:i:s');
    
    // Simulação de resposta de API bem-sucedida
    // Em produção, substitua por código real de integração com WhatsApp Business API
    $success = true;
    $responseMessage = "Mensagem de teste enviada com sucesso para $telefoneDestino";
    
    // Registrar no log
    $sql = "INSERT INTO mensagens_enviadas (id_reserva, tipo, destinatario, conteudo, status) 
            VALUES (0, 'whatsapp', '$telefoneDestino', '$mensagem', 'teste')";
    $conexao->query($sql);
    
    echo json_encode([
        'sucesso' => $success,
        'mensagem' => $responseMessage,
        'detalhes' => [
            'destino' => $telefoneDestino,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Configurações não encontradas']);
}

$conexao->close();
?>
