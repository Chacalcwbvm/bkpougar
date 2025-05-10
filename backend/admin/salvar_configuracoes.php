
<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Lidar com solicitações OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificação básica de autenticação (em produção, use um método mais seguro)
// TODO: Implementar autenticação adequada para administradores

// Obter configurações atuais
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM configuracoes LIMIT 1";
    $resultado = $conexao->query($sql);
    
    if ($resultado && $resultado->num_rows > 0) {
        $config = $resultado->fetch_assoc();
        echo json_encode(['sucesso' => true, 'configuracoes' => $config]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao buscar configurações', 'erro' => $conexao->error]);
    }
    exit;
}

// Atualizar configurações
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (!$dados) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados inválidos']);
        exit;
    }
    
    // Determinar qual tipo de configuração está sendo atualizada
    $tipo = isset($dados['tipo']) ? $dados['tipo'] : 'geral';
    
    switch ($tipo) {
        case 'geral':
            updateGeneralSettings($conexao, $dados);
            break;
        case 'notificacao':
            updateNotificationSettings($conexao, $dados);
            break;
        case 'api':
            updateApiSettings($conexao, $dados);
            break;
        case 'email':
            updateEmailSettings($conexao, $dados);
            break;
        default:
            echo json_encode(['sucesso' => false, 'mensagem' => 'Tipo de configuração inválido']);
            exit;
    }
}

// Função para atualizar configurações gerais
function updateGeneralSettings($conexao, $dados) {
    // Sanitizar entradas
    $nome_site = $conexao->real_escape_string($dados['hotelName'] ?? '');
    $endereco = $conexao->real_escape_string($dados['address'] ?? '');
    $telefone = $conexao->real_escape_string($dados['phone'] ?? '');
    $email = $conexao->real_escape_string($dados['email'] ?? '');
    $horario_checkin = $dados['checkInTime'] ?? '15:00:00';
    $horario_checkout = $dados['checkOutTime'] ?? '11:00:00';
    $moeda = $conexao->real_escape_string($dados['currency'] ?? 'USD');
    $logo_url = $conexao->real_escape_string($dados['logoUrl'] ?? '');
    $pix_key = $conexao->real_escape_string($dados['pixKey'] ?? '');
    $pix_key_type = $conexao->real_escape_string($dados['pixKeyType'] ?? 'CPF');
    $pix_beneficiary = $conexao->real_escape_string($dados['pixBeneficiary'] ?? '');
    $reservation_deposit_percentage = intval($dados['reservationDepositPercentage'] ?? 30);
    $manager_whatsapp = $conexao->real_escape_string($dados['managerWhatsApp'] ?? '');
    
    // Verificar se já existe um registro de configurações
    $check = $conexao->query("SELECT COUNT(*) as count FROM configuracoes");
    $row = $check->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Se não existir, inserir novo registro
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
                '$nome_site', 
                '$endereco', 
                '$telefone', 
                '$email', 
                '$horario_checkin', 
                '$horario_checkout', 
                '$moeda',
                '$logo_url',
                '$pix_key',
                '$pix_key_type',
                '$pix_beneficiary',
                $reservation_deposit_percentage,
                '$manager_whatsapp'
            )";
    } else {
        // Se existir, atualizar
        $sql = "UPDATE configuracoes SET 
                nome_site = '$nome_site',
                endereco = '$endereco',
                telefone = '$telefone',
                email = '$email',
                horario_checkin = '$horario_checkin',
                horario_checkout = '$horario_checkout',
                moeda = '$moeda',
                logo_url = '$logo_url',
                pix_key = '$pix_key',
                pix_key_type = '$pix_key_type',
                pix_beneficiary = '$pix_beneficiary',
                reservation_deposit_percentage = $reservation_deposit_percentage,
                manager_whatsapp = '$manager_whatsapp'
                WHERE id = 1";
    }
    
    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações gerais atualizadas com sucesso']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar configurações gerais', 'erro' => $conexao->error]);
    }
}

// Função para atualizar configurações de notificação
function updateNotificationSettings($conexao, $dados) {
    // Vamos salvar os templates como JSON na tabela de configurações
    $templates = [
        'emailTemplate' => $dados['emailTemplate'] ?? '',
        'whatsAppTemplate' => $dados['whatsAppTemplate'] ?? '',
        'emailNotifications' => $dados['emailNotifications'] ?? true,
        'whatsAppNotifications' => $dados['whatsAppNotifications'] ?? true,
        'confirmationMessages' => $dados['confirmationMessages'] ?? true,
        'reminderMessages' => $dados['reminderMessages'] ?? true,
        'notifyForNewBookings' => $dados['notifyForNewBookings'] ?? true,
        'notifyForCancellations' => $dados['notifyForCancellations'] ?? true
    ];
    
    $templates_json = $conexao->real_escape_string(json_encode($templates));
    
    // Verificar se a coluna notification_settings existe na tabela configuracoes
    $check_column = $conexao->query("SHOW COLUMNS FROM configuracoes LIKE 'notification_settings'");
    if ($check_column->num_rows == 0) {
        // Se não existir, criar a coluna
        $conexao->query("ALTER TABLE configuracoes ADD COLUMN notification_settings TEXT");
    }
    
    // Verificar se existe um registro de configurações
    $check = $conexao->query("SELECT COUNT(*) as count FROM configuracoes");
    $row = $check->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Se não existir, inserir novo registro
        $sql = "INSERT INTO configuracoes (notification_settings) VALUES ('$templates_json')";
    } else {
        // Se existir, atualizar
        $sql = "UPDATE configuracoes SET notification_settings = '$templates_json' WHERE id = 1";
    }
    
    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações de notificação atualizadas com sucesso']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar configurações de notificação', 'erro' => $conexao->error]);
    }
}

// Função para atualizar configurações de API
function updateApiSettings($conexao, $dados) {
    $email_api_key = $conexao->real_escape_string($dados['emailApiKey'] ?? '');
    $whatsapp_api_key = $conexao->real_escape_string($dados['whatsAppApiKey'] ?? '');
    $whatsapp_business_phone = $conexao->real_escape_string($dados['whatsAppBusinessPhoneNumber'] ?? '');
    $whatsapp_business_id = $conexao->real_escape_string($dados['whatsAppBusinessID'] ?? '');
    
    // Verificar se existe um registro de configurações
    $check = $conexao->query("SELECT COUNT(*) as count FROM configuracoes");
    $row = $check->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Se não existir, inserir novo registro
        $sql = "INSERT INTO configuracoes (
                email_api_key, 
                whatsapp_api_key, 
                whatsapp_business_phone, 
                whatsapp_business_id
            ) VALUES (
                '$email_api_key', 
                '$whatsapp_api_key', 
                '$whatsapp_business_phone', 
                '$whatsapp_business_id'
            )";
    } else {
        // Se existir, atualizar
        $sql = "UPDATE configuracoes SET 
                email_api_key = '$email_api_key',
                whatsapp_api_key = '$whatsapp_api_key',
                whatsapp_business_phone = '$whatsapp_business_phone',
                whatsapp_business_id = '$whatsapp_business_id'
                WHERE id = 1";
    }
    
    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações de API atualizadas com sucesso']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar configurações de API', 'erro' => $conexao->error]);
    }
}

// Função para atualizar configurações de Email
function updateEmailSettings($conexao, $dados) {
    // Verificar se a coluna email_settings existe na tabela configuracoes
    $check_column = $conexao->query("SHOW COLUMNS FROM configuracoes LIKE 'email_settings'");
    if ($check_column->num_rows == 0) {
        $conexao->query("ALTER TABLE configuracoes ADD COLUMN email_settings TEXT");
    }
    
    // Preparar as configurações para salvar em JSON
    $email_settings = [
        'smtpServer' => $dados['smtpServer'] ?? 'smtp.example.com',
        'smtpPort' => $dados['smtpPort'] ?? '587',
        'smtpUsername' => $dados['smtpUsername'] ?? '',
        'smtpPassword' => $dados['smtpPassword'] ?? '',
        'emailSender' => $dados['emailSender'] ?? 'noreply@pousadaviva.com',
        'emailReplyTo' => $dados['emailReplyTo'] ?? 'info@pousadaviva.com',
        'useSSL' => $dados['useSSL'] ?? true,
        'useAuthentication' => $dados['useAuthentication'] ?? true
    ];
    
    $email_settings_json = $conexao->real_escape_string(json_encode($email_settings));
    
    // Verificar se existe um registro de configurações
    $check = $conexao->query("SELECT COUNT(*) as count FROM configuracoes");
    $row = $check->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Se não existir, inserir novo registro
        $sql = "INSERT INTO configuracoes (email_settings) VALUES ('$email_settings_json')";
    } else {
        // Se existir, atualizar
        $sql = "UPDATE configuracoes SET email_settings = '$email_settings_json' WHERE id = 1";
    }
    
    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações de email atualizadas com sucesso']);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar configurações de email', 'erro' => $conexao->error]);
    }
}

$conexao->close();
?>
