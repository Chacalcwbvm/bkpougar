
<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (!$dados || empty($dados['chave']) || empty($dados['beneficiario']) || !isset($dados['valor'])) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Dados incompletos para gerar QR code PIX'
        ]);
        exit;
    }
    
    // Formatar os dados para o payload do PIX
    $pixKey = $dados['chave'];
    $pixKeyType = $dados['tipoChave'] ?? 'CPF';
    $beneficiary = $dados['beneficiario'];
    $amount = number_format($dados['valor'], 2, '.', '');
    $description = isset($dados['descricao']) ? substr($dados['descricao'], 0, 50) : 'Reserva';
    
    // Simplificado: normalmente seria usado uma biblioteca para gerar o PIX
    // Aqui vamos apenas simular a geração criando uma imagem de QR code
    
    // Cria uma string representando os dados do PIX
    $pixData = "00020126";  // Payload Format Indicator e Merchant Account Information
    $pixData .= "52040000"; // Merchant Category Code e Transaction Currency
    $pixData .= "5303986";  // Country Code (986 = BRL)
    $pixData .= "54" . strlen($amount) . $amount; // Transaction Amount
    
    // Adiciona chave PIX
    $pixKeyData = "$pixKeyType:$pixKey";
    $pixData .= "62" . strlen($pixKeyData) . $pixKeyData;
    
    // Adiciona descrição
    if (!empty($description)) {
        $pixData .= "80" . strlen($description) . $description;
    }
    
    // Em um sistema real, este seria o momento de calcular o CRC16 e adicioná-lo ao código
    
    // Aqui usamos uma API pública para gerar o QR Code
    $qrCodeUrl = "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" . urlencode($pixData);
    
    // Registro em log
    $id_reserva = isset($dados['id_reserva']) ? intval($dados['id_reserva']) : 0;
    if ($id_reserva > 0) {
        $sql = "INSERT INTO logs_financeiro (id_reserva, tipo, valor, data_transacao, detalhes)
                VALUES ($id_reserva, 'qrcode_pix', $amount, NOW(), '" . $conexao->real_escape_string($description) . "')";
        $conexao->query($sql);
    }
    
    echo json_encode([
        'sucesso' => true,
        'qrCodeUrl' => $qrCodeUrl,
        'pixKey' => $pixKey,
        'amount' => $amount
    ]);
    
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
}

$conexao->close();
?>
