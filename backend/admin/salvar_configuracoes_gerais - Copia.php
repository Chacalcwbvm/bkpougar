<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, INPUT, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Decodificar o corpo da requisição JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados inválidos ou incompletos']);
    exit;
}

// Extrair e sanitizar os dados
$hotelName = isset($data['hotelName']) ? $conexao->real_escape_string($data['hotelName']) : 'Pousada Pouso das Garças';
$address = isset($data['address']) ? $conexao->real_escape_string($data['address']) : '';
$phone = isset($data['phone']) ? $conexao->real_escape_string($data['phone']) : '';
$email = isset($data['email']) ? $conexao->real_escape_string($data['email']) : '';
$checkInTime = isset($data['checkInTime']) ? $conexao->real_escape_string($data['checkInTime']) : '15:00';
$checkOutTime = isset($data['checkOutTime']) ? $conexao->real_escape_string($data['checkOutTime']) : '11:00';
$currency = isset($data['currency']) ? $conexao->real_escape_string($data['currency']) : 'USD';
$logoUrl = isset($data['logoUrl']) ? $conexao->real_escape_string($data['logoUrl']) : '';
$pixKey = isset($data['pixKey']) ? $conexao->real_escape_string($data['pixKey']) : '';
$pixKeyType = isset($data['pixKeyType']) ? $conexao->real_escape_string($data['pixKeyType']) : 'CPF';
$pixBeneficiary = isset($data['pixBeneficiary']) ? $conexao->real_escape_string($data['pixBeneficiary']) : '';
$reservationDepositPercentage = isset($data['reservationDepositPercentage']) ? intval($data['reservationDepositPercentage']) : 30;
$managerWhatsApp = isset($data['managerWhatsApp']) ? $conexao->real_escape_string($data['managerWhatsApp']) : '';

// Verificar se a tabela configuracoes existe
$check_table = $conexao->query("SHOW TABLES LIKE 'configuracoes'");
if ($check_table->num_rows == 0) {
    // Cria a tabela se não existir
    $sql_create = "CREATE TABLE configuracoes (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome_site VARCHAR(100) NOT NULL,
        endereco TEXT,
        telefone VARCHAR(50),
        email VARCHAR(100),
        horario_checkin TIME,
        horario_checkout TIME,
        moeda VARCHAR(10),
        logo_url VARCHAR(255),
        pix_key VARCHAR(255),
        pix_key_type VARCHAR(50),
        pix_beneficiary VARCHAR(100),
        reservation_deposit_percentage INT(3),
        manager_whatsapp VARCHAR(50),
        notification_settings JSON,
        email_settings JSON,
        email_api_key VARCHAR(255),
        whatsapp_api_key VARCHAR(255),
        whatsapp_business_phone VARCHAR(50),
        whatsapp_business_id VARCHAR(255)
    )";
    $conexao->query($sql_create);
}

// Verificar se já existe um registro
$check_config = $conexao->query("SELECT id FROM configuracoes LIMIT 1");

if ($check_config->num_rows > 0) {
    // Atualizar registro existente
    $sql = "UPDATE configuracoes SET
        nome_site = '$hotelName',
        endereco = '$address',
        telefone = '$phone',
        email = '$email',
        horario_checkin = '$checkInTime:00',
        horario_checkout = '$checkOutTime:00',
        moeda = '$currency',
        logo_url = '$logoUrl',
        pix_key = '$pixKey',
        pix_key_type = '$pixKeyType',
        pix_beneficiary = '$pixBeneficiary',
        reservation_deposit_percentage = $reservationDepositPercentage,
        manager_whatsapp = '$managerWhatsApp'
        WHERE id = 1";
} else {
    // Inserir novo registro
    $sql = "INSERT INTO configuracoes (
        nome_site, 
        endereco, 
        telefone, 
        email, 
        horario_checkin, 
        horario_checkout, 
        moeda,
        logo_url,
        pix_key,
        pix_key_type,
        pix_beneficiary,
        reservation_deposit_percentage,
        manager_whatsapp
    ) VALUES (
        '$hotelName',
        '$address',
        '$phone',
        '$email',
        '$checkInTime:00',
        '$checkOutTime:00',
        '$currency',
        '$logoUrl',
        '$pixKey',
        '$pixKeyType',
        '$pixBeneficiary',
        $reservationDepositPercentage,
        '$managerWhatsApp'
    )";
}

if ($conexao->query($sql)) {
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Configurações salvas com sucesso'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao salvar configurações: ' . $conexao->error
    ]);
}

$conexao->close();
?>
