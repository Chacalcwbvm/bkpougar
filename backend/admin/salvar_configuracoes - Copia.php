<?php
// C:\pousada\backend\api\configuracoes.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once '../conexao.php';

// Função para buscar configurações gerais
function buscarConfiguracoes($conexao) {
    $sql = "SELECT * FROM configuracoes WHERE id = 1";
    $resultado = $conexao->query($sql);

    if ($resultado->num_rows > 0) {
        $linha = $resultado->fetch_assoc();
        $linha['notificacoes'] = json_decode($linha['notification_settings'], true);
        $linha['email'] = json_decode($linha['email_settings'], true);
        echo json_encode($linha);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Nenhuma configuração encontrada.']);
    }
}

// Função para atualizar configurações gerais
function atualizarConfiguracoesGerais($conexao, $dados) {
    $nome_empresa = $conexao->real_escape_string($dados['nome_empresa']);
    $telefone = $conexao->real_escape_string($dados['telefone']);
    $email = $conexao->real_escape_string($dados['email']);
    $endereco = $conexao->real_escape_string($dados['endereco']);
    $tema = $conexao->real_escape_string($dados['tema']);

    $sql = "UPDATE configuracoes SET 
                nome_empresa = '$nome_empresa', 
                telefone = '$telefone', 
                email = '$email', 
                endereco = '$endereco', 
                tema = '$tema'
            WHERE id = 1";

    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações gerais atualizadas com sucesso']);
    } else {
        error_log("Erro SQL em atualizarConfiguracoesGerais: " . $conexao->error);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno ao atualizar configurações']);
    }
}

// Função para atualizar configurações de notificação
function updateNotificationSettings($conexao, $dados) {
    $check_column = $conexao->query("SHOW COLUMNS FROM configuracoes LIKE 'notification_settings'");
    if ($check_column->num_rows == 0) {
        $conexao->query("ALTER TABLE configuracoes ADD COLUMN notification_settings TEXT");
    }

    $notificacoes = [
        'whatsappNotifications' => !empty($dados['whatsappNotifications']) ? 1 : 0,
        'emailNotifications' => !empty($dados['emailNotifications']) ? 1 : 0,
        'smsNotifications' => !empty($dados['smsNotifications']) ? 1 : 0
    ];

    $notificacoes_json = $conexao->real_escape_string(json_encode($notificacoes));
    $sql = "UPDATE configuracoes SET notification_settings = '$notificacoes_json' WHERE id = 1";

    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações de notificação atualizadas com sucesso']);
    } else {
        error_log("Erro SQL em updateNotificationSettings: " . $conexao->error);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno ao atualizar configurações']);
    }
}

// Função para atualizar configurações de API
function updateApiSettings($conexao, $dados) {
    $api_key = $conexao->real_escape_string($dados['api_key']);
    $api_secret = $conexao->real_escape_string($dados['api_secret']);
    $sql = "UPDATE configuracoes SET api_key = '$api_key', api_secret = '$api_secret' WHERE id = 1";

    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Chaves de API atualizadas com sucesso']);
    } else {
        error_log("Erro SQL em updateApiSettings: " . $conexao->error);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno ao atualizar chaves de API']);
    }
}

// Função para atualizar configurações de e-mail
function updateEmailSettings($conexao, $dados) {
    $check_column = $conexao->query("SHOW COLUMNS FROM configuracoes LIKE 'email_settings'");
    if ($check_column->num_rows == 0) {
        $conexao->query("ALTER TABLE configuracoes ADD COLUMN email_settings TEXT");
    }

    $email_settings = [
        'email_smtp_host' => $dados['email_smtp_host'] ?? '',
        'email_smtp_port' => $dados['email_smtp_port'] ?? '',
        'email_smtp_usuario' => $dados['email_smtp_usuario'] ?? '',
        'email_smtp_senha' => $dados['email_smtp_senha'] ?? '',
        'email_remetente_nome' => $dados['email_remetente_nome'] ?? '',
        'email_remetente_endereco' => $dados['email_remetente_endereco'] ?? '',
        'useSSL' => !empty($dados['useSSL']) ? 1 : 0,
        'useAuthentication' => !empty($dados['useAuthentication']) ? 1 : 0
    ];

    $email_settings_json = $conexao->real_escape_string(json_encode($email_settings));

    $sql = "UPDATE configuracoes SET email_settings = '$email_settings_json' WHERE id = 1";

    if ($conexao->query($sql)) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Configurações de email atualizadas com sucesso']);
    } else {
        error_log("Erro SQL em updateEmailSettings: " . $conexao->error);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno ao atualizar configurações de email']);
    }
}

// Roteamento de requisições
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'GET') {
    buscarConfiguracoes($conexao);
} elseif ($metodo == 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    if (!$dados || !isset($dados['tipo'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados ou tipo de configuração ausente']);
        exit;
    }

    switch ($dados['tipo']) {
        case 'geral':
            atualizarConfiguracoesGerais($conexao, $dados);
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
            break;
    }
} elseif ($metodo == 'OPTIONS') {
    http_response_code(204);
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método HTTP não suportado']);
}
